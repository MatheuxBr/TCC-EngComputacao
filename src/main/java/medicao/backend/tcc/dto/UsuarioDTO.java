package medicao.backend.tcc.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import medicao.backend.tcc.model.Usuario;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {
    private Long id;
    private String email;
    private String username;
    private Integer idNivel;
    private String nomeNivel;

    public UsuarioDTO(Usuario usuario) {
        this.id = usuario.getId();
        this.email = usuario.getEmail();
        this.username = usuario.getUsuario();
        if (usuario.getNivelAcesso() != null) {
            this.idNivel = usuario.getNivelAcesso().getIdNivel();
            this.nomeNivel = usuario.getNivelAcesso().getNomeNivel();
        }
    }
}
