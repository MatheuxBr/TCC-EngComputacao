package medicao.backend.tcc.controller;

import medicao.backend.tcc.dto.UsuarioDTO;
import medicao.backend.tcc.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.listarUsuarios());
    }

    @PatchMapping("/{id}/promover")
    public ResponseEntity<?> promoverParaAdmin(@PathVariable Long id) {
        try {
            usuarioService.promoverParaAdmin(id);
            return ResponseEntity.ok(Map.of("message", "Usuário promovido para Administrador."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
