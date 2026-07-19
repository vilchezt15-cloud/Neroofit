import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amountCents, customerName, customerCpf, dueDate, description } = body;
        
        // ASAAS API KEY (Sandbox by default for dev)
        // O cliente precisa configurar isso no .env.local como ASAAS_API_KEY
        const ASAAS_KEY = process.env.ASAAS_API_KEY;
        
        if (!ASAAS_KEY || ASAAS_KEY.trim() === '') {
             // Retorna um Mock funcional simulando Asaas se a chave não existir
             // Isso permite que o painel continue funcionando sem travar a experiência
             return NextResponse.json({
                 success: true, 
                 gateway_id: 'mock_asaas_' + Date.now(),
                 gateway_url: '00020101021126580014br.gov.bcb.pix0136' + crypto.randomUUID().replace(/-/g,'').substring(0,25) + '0208Mock Asaas5204000053039865802BR5915Mock Personal6009SAO PAULO62070503***6304',
                 mock: true
             });
        }
        
        // 1. Create/Find Customer on Asaas
        // (Simplificado para o MVP: cria um novo customer a cada vez. Numa V2, salva o Asaas ID no perfil do aluno)
        const customerResponse = await fetch('https://sandbox.asaas.com/api/v3/customers', {
            method: 'POST',
            headers: { 'access_token': ASAAS_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: customerName || 'Aluno Sem Nome', 
                cpfCnpj: customerCpf || '00000000000' // CPF Fixo para passar pela Sandbox
            })
        });
        const customerData = await customerResponse.json();
        
        if (!customerData.id) {
            console.error("Asaas erro ao criar cliente:", customerData);
            throw new Error('Falha ao criar cliente no Asaas. Verifique logs.');
        }

        // 2. Create Charge (Cobrança)
        const chargeResponse = await fetch('https://sandbox.asaas.com/api/v3/payments', {
             method: 'POST',
             headers: { 'access_token': ASAAS_KEY, 'Content-Type': 'application/json' },
             body: JSON.stringify({
                 customer: customerData.id,
                 billingType: 'PIX',
                 dueDate: dueDate || new Date().toISOString().split('T')[0],
                 value: (amountCents / 100).toFixed(2),
                 description: description || 'Mensalidade Consultoria Esportiva',
             })
        });
        const chargeData = await chargeResponse.json();
        
        if (!chargeData.id) {
            console.error("Asaas erro ao gerar cobrança:", chargeData);
            throw new Error('Falha ao gerar cobrança no Asaas. Verifique logs.');
        }

        // 3. Obter QR Code PIX / Linha Digitável
        const pixResponse = await fetch(`https://sandbox.asaas.com/api/v3/payments/${chargeData.id}/pixQrCode`, {
            method: 'GET',
            headers: { 'access_token': ASAAS_KEY }
        });
        const pixData = await pixResponse.json();

        return NextResponse.json({
            success: true,
            gateway_id: chargeData.id,
            gateway_url: pixData.payload || chargeData.invoiceUrl // Linha digitável PIX (payload)
        });
        
    } catch(err: any) {
        console.error("Erro Rota API Asaas:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
