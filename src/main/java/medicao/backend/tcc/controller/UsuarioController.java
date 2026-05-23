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
    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluirUsuario(@PathVariable Long id, @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {
        if (currentUserId != null && currentUserId.equals(id)) {
            return ResponseEntity.status(403).body(Map.of("error", "Não é possível excluir a própria conta."));
        }
        try {
            usuarioService.excluirUsuario(id);
            return ResponseEntity.ok(Map.of("message", "Usuário excluído com sucesso."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
