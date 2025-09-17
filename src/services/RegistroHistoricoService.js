const { Registro, Historico, Horarios } = require('../models/Registro_historico');

class HistoricoService {
    async createHistorico(data) {
        return await Historico.create(data);
    }

    async getAllHistorico() {
        return await Historico.findAll();
    }

    async getHistorico(Historico_id) {
        return await Historico.findByPk(Historico_id);
    }

    async updateHistorico(Historico_id, data) {
        await Historico.update(data, { where: { historico_id: Historico_id } });
        return await Historico.findByPk(Historico_id);
    }

    async deleteHistorico(Historico_id) {
        return await Historico.destroy({ where: { historico_id: Historico_id } });
    }
}

class RegistroService {
    async createRegistro(data) {
        return await Registro.create(data);
    }

    async getAllRegistro() {
        return await Registro.findAll();
    }

    async getRegistro(Registro_id) {
        return await Registro.findByPk(Registro_id);
    }

    async updateRegistro(Registro_id, data) {
        await Registro.update(data, { where: { id: Registro_id } });
        return await Registro.findByPk(Registro_id);
    }

    async deleteRegistro(Registro_id) {
        return await Registro.destroy({ where: { id: Registro_id } });
    }

}
class horariosService{
    async getAllHorarios(){
        return await Horarios.findAll();
    }
}
module.exports = {
    historicoService: new HistoricoService(),
    registroService: new RegistroService(),
    horariosService: new horariosService()
};