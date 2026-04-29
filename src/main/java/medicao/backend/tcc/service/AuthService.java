package medicao.backend.tcc.service;

import medicao.backend.tcc.dto.LoginRequest;
import medicao.backend.tcc.dto.RegisterRequest;
import medicao.backend.tcc.model.Usuario;
import medicao.backend.tcc.repository.UsuarioRepository;
import medicao.backend.tcc.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public String authenticate(LoginRequest request) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsuario(request.getUsername());
        
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (passwordEncoder.matches(request.getPassword(), usuario.getSenha())) {
                return jwtUtil.generateToken(usuario.getUsuario());
            }
        }
        return null;
    }

    public Usuario register(RegisterRequest request) {
        if (usuarioRepository.existsByUsuario(request.getUsername())) {
            throw new RuntimeException("Usuário já existe");
        }
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email já existe");
        }

        Usuario novoUsuario = new Usuario();
        novoUsuario.setUsuario(request.getUsername());
        novoUsuario.setEmail(request.getEmail());
        novoUsuario.setSenha(passwordEncoder.encode(request.getPassword()));

        return usuarioRepository.save(novoUsuario);
    }
}
