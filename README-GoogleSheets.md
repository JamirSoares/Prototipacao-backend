# Configuração do Google Sheets Service

Este serviço baixa automaticamente planilhas do Google Sheets e as salva como arquivos Excel a cada 15 minutos.

## Configuração das Credenciais do Google

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a Google Sheets API:
   - Vá para "APIs e Serviços" > "Biblioteca"
   - Procure por "Google Sheets API" e ative-a
4. Crie uma conta de serviço:
   - Vá para "APIs e Serviços" > "Credenciais"
   - Clique em "Criar Credenciais" > "Conta de Serviço"
   - Configure a conta de serviço com as permissões necessárias
5. Gere uma chave JSON para a conta de serviço:
   - Na lista de contas de serviço, clique na conta criada
   - Vá para a aba "Chaves"
   - Clique em "Adicionar Chave" > "Criar nova chave"
   - Selecione formato JSON e baixe o arquivo
6. Renomeie o arquivo baixado para `credenciais.json` e coloque-o na raiz do diretório `Backend/`
7. Compartilhe as planilhas do Google Sheets com o email da conta de serviço (`cliente_email` do arquivo JSON)

## Arquivo credenciais.json.exemplo

Use o arquivo `credenciais.json.exemplo` como referência para criar seu arquivo `credenciais.json` com suas próprias credenciais.

## Funcionalidades

O serviço baixa automaticamente as seguintes planilhas:

1. **Reclamação/Devolução** - Aba "Registro de Ocorrências"
2. **Virada de Coleção** - Aba "Virada de Coleção"
3. **Correios** - Aba "Correios"
4. **Faturamento** - Aba "Faturamento"

Os arquivos são salvos em: `\\\\192.168.0.7\\organiza\\PowerBI\\Modelos\\Arquivos complementares`

## Executar Manualmente

Para executar o serviço manualmente:

```javascript
import { baixarTodasAsPlanilhas } from './services/googleSheetsService.js';

baixarTodasAsPlanilhas();
```
