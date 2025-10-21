# 🚀 Setup do Processamento FIPE no Easypanel

## 📋 Problema Resolvido

O script `scripts/process-fipe.js` agora roda no Easypanel através de uma **API REST** que processa as 50 mil linhas da tabela `fipe` e alimenta as tabelas otimizadas.

## ⚙️ Configuração no Easypanel

### 1. Variáveis de Ambiente Obrigatórias

Configure estas variáveis no Easypanel:

```bash
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
JWT_SECRET=seu_jwt_secret
ADMIN_MASTER_PASSWORD=sua_senha_admin
```

**IMPORTANTE:** A `SUPABASE_SERVICE_ROLE_KEY` é essencial para o processamento funcionar!

### 2. Deploy

1. Faça commit e push das alterações
2. O Easypanel irá rebuildar automaticamente com o novo Dockerfile
3. Aguarde o build completar

## 🔥 Como Executar o Processamento

### Opção 1: Via cURL (Recomendado)

```bash
curl -X POST https://seu-dominio.com/api/process-fipe
```

### Opção 2: Via Browser

Acesse no navegador:
```
https://seu-dominio.com/api/process-fipe
```

Use uma ferramenta como Postman ou ThunderClient e faça um **POST** request.

### Opção 3: Via Script (Local)

Ainda pode rodar localmente se preferir:
```bash
npm run process-fipe
```

## 📊 O Que o Processamento Faz

1. **Lê** todas as ~50 mil linhas da tabela `fipe`
2. **Processa** os dados em 3 tipos: CAR, MOTORCYCLE, TRUCK
3. **Gera** dados únicos para:
   - `fipe_marcas_unicas` (marcas)
   - `fipe_modelos_unicos` (modelos)
   - `fipe_versoes_unicas` (versões com categoria e combustível)
4. **Insere** em lotes para otimização

## ✅ Resposta de Sucesso

```json
{
  "success": true,
  "message": "Processamento FIPE concluído com sucesso",
  "resultados": [
    {
      "tipo": "CAR",
      "processado": 45320,
      "marcas": 85,
      "modelos": 2450,
      "versoes": 15670
    },
    {
      "tipo": "MOTORCYCLE",
      "processado": 3200,
      "marcas": 45,
      "modelos": 680,
      "versoes": 2100
    },
    {
      "tipo": "TRUCK",
      "processado": 1480,
      "marcas": 25,
      "modelos": 320,
      "versoes": 890
    }
  ]
}
```

## ⏱️ Tempo Estimado

- **50 mil linhas**: ~2-5 minutos dependendo da conexão com Supabase
- O processo roda em memória, então é rápido

## 🔍 Logs

Os logs aparecem no console do servidor. No Easypanel:
1. Vá em **Logs** do seu app
2. Execute o endpoint
3. Veja o progresso em tempo real

## ❌ Troubleshooting

### Erro: "SUPABASE_SERVICE_ROLE_KEY não configurada"
- Configure a variável de ambiente no Easypanel
- Rebuild o app

### Erro: Timeout
- A API tem timeout padrão do Next.js (~60s)
- Para processar grandes volumes, considere aumentar o timeout ou processar em background

### Nenhum dado inserido
- Verifique se a tabela `fipe` tem dados
- Confirme que as tabelas destino existem:
  - `fipe_marcas_unicas`
  - `fipe_modelos_unicos`
  - `fipe_versoes_unicas`

## 🎯 Próximos Passos

Após processar, suas tabelas estarão prontas para:
- Buscas rápidas de marcas
- Filtros por modelo
- Autocomplete de versões
- Filtros por categoria/combustível

## 🔄 Reprocessamento

Para reprocessar (atualizar dados):
- Basta chamar a API novamente
- Usa `UPSERT`, então não duplica dados
- Atualiza registros existentes