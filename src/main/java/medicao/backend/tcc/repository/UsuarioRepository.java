package medicao.backend.tcc.repository;

import medicao.backend.tcc.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsuario(String usuario);
    Optional<Usuario> findByEmail(String email);
    boolean existsByUsuario(String usuario);
    boolean existsByEmail(String email);
    java.util.List<Usuario> findByNivelAcessoNomeNivel(String nomeNivel);

    @Query("SELECT u FROM Usuario u WHERE u.nivelAcesso.idNivel = 1 OR UPPER(u.nivelAcesso.nomeNivel) = 'ADMIN'")
    java.util.List<Usuario> findAdmins();
}
