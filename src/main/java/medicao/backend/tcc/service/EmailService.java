package medicao.backend.tcc.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender emailSender;

    public EmailService(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }

    @Async
    public void enviarEmailSimples(String para, String assunto, String texto) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("tccpiscinaesport@gmail.com");
            message.setTo(para);
            message.setSubject(assunto);
            message.setText(texto);
            emailSender.send(message);
        } catch (Exception e) {
            System.err.println("Erro ao enviar email para: " + para + " - " + e.getMessage());
        }
    }
}
