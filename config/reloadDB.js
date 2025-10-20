import { connectDB } from './db.js';
import { generateData as generateRelatorioCompras } from '../services/relatorioComprasService.js';

/**
 * Função para recarregar/gerar todos os dados do sistema
 * Inclui verificação de duplicados para evitar inserções repetidas
 */
export async function reloadDB() {
  try {
    console.log('🔄 Iniciando reload do banco de dados...');
    
    // Conecta ao banco
    await connectDB();
    console.log('✅ Conexão com banco estabelecida');

    // Gera dados do Relatório de Compras
    console.log('📊 Gerando dados do Relatório de Compras...');
    try {
      const resultCompras = await generateRelatorioCompras();
      console.log(`✅ Relatório de Compras: ${resultCompras.message}`);
      if (resultCompras.rowsAffected) {
        console.log(`   📈 Registros inseridos: ${resultCompras.rowsAffected}`);
      }
    } catch (err) {
      console.error('❌ Erro ao gerar dados do Relatório de Compras:', err.message);
    }

    // Aqui você pode adicionar outras funções de geração de dados
    // Exemplo:
    // console.log('📊 Gerando dados do Relatório CMP...');
    // await generateRelatorioCMP();
    
    console.log('🎉 Reload do banco de dados concluído!');
    return { success: true, message: 'Reload concluído com sucesso' };
    
  } catch (err) {
    console.error('❌ Erro durante reload do banco de dados:', err);
    throw err;
  }
}

/**
 * Função para verificar o status dos dados
 */
export async function checkDataStatus() {
  try {
    const pool = await connectDB();
    
    // Verifica status do Relatório de Compras
    const comprasStatus = await pool.request()
      .query(`
        SELECT 
          COUNT(*) as totalRegistros,
          COUNT(DISTINCT numeroDocumento) as documentosUnicos,
          COUNT(DISTINCT cadProdutoId) as produtosUnicos
        FROM IMAGEMUNIFORMES_pBI.dbo.RelatorioCompras
        WHERE numeroDocumento IS NOT NULL
      `);

    return {
      relatorioCompras: comprasStatus.recordset[0]
    };
    
  } catch (err) {
    console.error('Erro ao verificar status dos dados:', err);
    throw err;
  }
}

export default {
  reloadDB,
  checkDataStatus
};
