package medicao.backend.tcc.service;

import com.influxdb.client.InfluxDBClient;
import com.influxdb.query.FluxRecord;
import com.influxdb.query.FluxTable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MedicaoService {

    private final InfluxDBClient influxDBClient;

    @Value("${influx.bucket}")
    private String bucket;

    @Value("${influx.org}")
    private String org;

    public MedicaoService(InfluxDBClient influxDBClient) {
        this.influxDBClient = influxDBClient;
    }

    // --- Parte 2: Ler (Query) ---
    public Map<String, Object> buscarUltimasMedicoes() {
        // Query Flux corrigida para pegar o último valor
        String query = "from(bucket: \"" + bucket + "\") " +
                "|> range(start: -24h) " + // Aumentei pra 24h pra garantir que acha seus dados
                "|> filter(fn: (r) => r[\"_measurement\"] == \"parametros_piscina\") " +
                "|> filter(fn: (r) => r[\"_field\"] == \"valor\") " +
                "|> last()";

        // Executa a consulta
        List<FluxTable> tables = influxDBClient.getQueryApi().query(query, org);

        Map<String, Object> resultado = new HashMap<>();

        // Transforma a resposta do banco em algo que o HTML entende
        for (FluxTable table : tables) {
            for (FluxRecord record : table.getRecords()) {
                String sensor = (String) record.getValueByKey("sensor_id");
                Object valor = record.getValue();

                if (sensor != null) {
                    resultado.put(sensor, valor);
                }
            }
        }
        return resultado;
    }

    // --- Parte 3: Ler Histórico (Query) ---
    public Map<String, List<Map<String, Object>>> buscarHistoricoMedicoes() {
        String query = "from(bucket: \"" + bucket + "\") " +
                "|> range(start: -24h) " +
                "|> filter(fn: (r) => r[\"_measurement\"] == \"parametros_piscina\") " +
                "|> filter(fn: (r) => r[\"_field\"] == \"valor\") ";

        List<FluxTable> tables = influxDBClient.getQueryApi().query(query, org);

        Map<String, List<Map<String, Object>>> resultado = new HashMap<>();

        for (FluxTable table : tables) {
            for (FluxRecord record : table.getRecords()) {
                String sensor = (String) record.getValueByKey("sensor_id");
                Object valor = record.getValue();
                java.time.Instant time = record.getTime();

                if (sensor != null) {
                    resultado.putIfAbsent(sensor, new java.util.ArrayList<>());
                    Map<String, Object> ponto = new HashMap<>();
                    ponto.put("time", time != null ? time.toString() : null);
                    ponto.put("valor", valor);
                    resultado.get(sensor).add(ponto);
                }
            }
        }
        return resultado;
    }
}