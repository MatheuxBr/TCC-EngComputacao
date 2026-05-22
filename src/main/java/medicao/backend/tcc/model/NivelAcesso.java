package medicao.backend.tcc.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "niveis_acesso")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NivelAcesso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_nivel")
    private Integer idNivel;

    @Column(name = "nome_nivel", unique = true, nullable = false)
    private String nomeNivel;
}
