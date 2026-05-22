package medicao.backend.tcc.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    @GetMapping("/pdf")
    public ResponseEntity<?> gerarPdf() {
        return ResponseEntity.ok(Map.of("message", "PDF exportado com sucesso (mock)."));
    }
}
