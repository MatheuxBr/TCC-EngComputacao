package medicao.backend.tcc.service;

import medicao.backend.tcc.dto.UsuarioDTO;
import medicao.backend.tcc.model.NivelAcesso;
import medicao.backend.tcc.model.Usuario;
import medicao.backend.tcc.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public List<UsuarioDTO> listarUsuarios() {
        return usuarioRepository.findAll()
                .stream()
                .map(UsuarioDTO::new)
                .collect(Collectors.toList());
    }

    public void promoverParaAdmin(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        NivelAcesso nivelAdmin = new NivelAcesso();
        nivelAdmin.setIdNivel(1);
        
        usuario.setNivelAcesso(nivelAdmin);
        usuarioRepository.save(usuario);
    }

    public void excluirUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuário não encontrado");
        }
        usuarioRepository.deleteById(id);
    }
}
