package medicao.backend.tcc.service;

import medicao.backend.tcc.model.Usuario;
import medicao.backend.tcc.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MedicaoWebSocketService {

    private final MedicaoService medicaoService;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;
    private final UsuarioRepository usuarioRepository;

    @Value("${alerta.ph.min:7.0}")
    private double phMin;

    @Value("${alerta.ph.max:8.0}")
    private double phMax;

    @Value("${alerta.temperatura.min:20.0}")
    private double tempMin;

    @Value("${alerta.temperatura.max:35.0}")
    private double tempMax;

    @Value("${alerta.cooldown.ms:3600000}")
    private long cooldownMs;

    private Map<String, Object> ultimasMedicoesCache;
    private long ultimoAlertaMs = 0;

    public MedicaoWebSocketService(MedicaoService medicaoService, SimpMessagingTemplate messagingTemplate, EmailService emailService, UsuarioRepository usuarioRepository) {
        this.medicaoService = medicaoService;
        this.messagingTemplate = messagingTemplate;
        this.emailService = emailService;
        this.usuarioRepository = usuarioRepository;
    }

    @Scheduled(fixedRate = 3000)
    public void enviarNovasMedicoes() {
        Map<String, Object> medicoesAtuais = medicaoService.buscarUltimasMedicoes();

        if (medicoesAtuais != null && !medicoesAtuais.isEmpty()) {
            if (ultimasMedicoesCache == null || !medicoesAtuais.equals(ultimasMedicoesCache)) {
                // envia para o websocket
                messagingTemplate.convertAndSend("/topic/medicoes", (Object) medicoesAtuais);
                ultimasMedicoesCache = medicoesAtuais;
                
                verificarAlertas(medicoesAtuais);
            }
        }
    }

    private void verificarAlertas(Map<String, Object> medicoes) {
        long agora = System.currentTimeMillis();
        if (agora - ultimoAlertaMs < cooldownMs) {
            return; // Cooldown ainda ativo
        }

        StringBuilder alertaMsg = new StringBuilder();

        // Verifica pH
        if (medicoes.containsKey("ph")) {
            try {
                double ph = Double.parseDouble(medicoes.get("ph").toString());
                if (ph < phMin || ph > phMax) {
                    alertaMsg.append("ALERTA: O nível de pH está fora do padrão (").append(ph).append(").\n");
                }
            } catch (NumberFormatException ignored) {}
        }

        // Verifica Temperatura
        if (medicoes.containsKey("temperatura")) {
            try {
                double temp = Double.parseDouble(medicoes.get("temperatura").toString());
                if (temp < tempMin || temp > tempMax) {
                    alertaMsg.append("ALERTA: A temperatura está fora do padrão (").append(temp).append("°C).\n");
                }
            } catch (NumberFormatException ignored) {}
        }

        if (alertaMsg.length() > 0) {
            List<Usuario> gestores = usuarioRepository.findByNivelAcessoNomeNivel("ADMIN");
            List<String> emailsGestores = gestores.stream()
                    .map(Usuario::getEmail)
                    .filter(email -> email != null && !email.isEmpty())
                    .collect(Collectors.toList());

            if (!emailsGestores.isEmpty()) {
                String mensagemFinal = "Parâmetros da Água em Alerta!\n\n" + alertaMsg.toString() + "\nPor favor, verifique o sistema de monitoramento.";
                for (String email : emailsGestores) {
                    emailService.enviarEmailSimples(email, "Alerta do Sistema de Monitoramento da Piscina", mensagemFinal);
                }
                ultimoAlertaMs = agora; // Reinicia o cooldown
            }
        }
    }
}
