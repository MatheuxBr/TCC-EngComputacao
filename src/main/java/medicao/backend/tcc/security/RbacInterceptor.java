package medicao.backend.tcc.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RbacInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String uri = request.getRequestURI();

        if (uri.startsWith("/api/relatorios/pdf")) {
            String headerNivel = request.getHeader("X-User-Nivel");

            if (headerNivel == null || !headerNivel.equals("1")) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("Acesso Negado: Apenas administradores podem acessar este recurso.");
                return false;
            }
        }

        return true;
    }
}
