package medicao.exemplo.tcc.controller;

import medicao.exemplo.tcc.service.MedicaoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api") // <--- PRESTE ATENÇÃO AQUI (Prefixo)
public class MedicaoController {

    private final MedicaoService service;

    public MedicaoController(MedicaoService service) {
        this.service = service;
    }

    @GetMapping("/dados-piscina") // <--- PRESTE ATENÇÃO AQUI (Nome do recurso)
    public Map<String, Object> getDados() {
        return service.buscarUltimasMedicoes();
    }

    @GetMapping("/historico")
    public java.util.Map<String, java.util.List<java.util.Map<String, Object>>> getHistorico() {
        return service.buscarHistoricoMedicoes();
    }
}