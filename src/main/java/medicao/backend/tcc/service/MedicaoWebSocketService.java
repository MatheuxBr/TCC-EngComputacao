package medicao.backend.tcc.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class MedicaoWebSocketService {

    private final MedicaoService medicaoService;
    private final SimpMessagingTemplate messagingTemplate;

    private Map<String, Object> ultimasMedicoesCache;

    public MedicaoWebSocketService(MedicaoService medicaoService, SimpMessagingTemplate messagingTemplate) {
        this.medicaoService = medicaoService;
        this.messagingTemplate = messagingTemplate;
    }

    @Scheduled(fixedRate = 3000)
    public void enviarNovasMedicoes() {
        Map<String, Object> medicoesAtuais = medicaoService.buscarUltimasMedicoes();

        if (medicoesAtuais != null && !medicoesAtuais.isEmpty()) {
            if (ultimasMedicoesCache == null || !medicoesAtuais.equals(ultimasMedicoesCache)) {
                // envia para o websocket
                messagingTemplate.convertAndSend("/topic/medicoes", (Object) medicoesAtuais);
                ultimasMedicoesCache = medicoesAtuais;
            }
        }
    }
}
