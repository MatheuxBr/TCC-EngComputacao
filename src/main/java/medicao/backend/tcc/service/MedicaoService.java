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

    // LER
    public Map<String, Object> buscarUltimasMedicoes() {
        String query = "from(bucket: \"" + bucket + "\") " +
                "|> range(start: -24h) " + // 24H
                "|> filter(fn: (r) => r[\"_measurement\"] == \"mqtt_consumer\") " +
                "|> group(columns: [\"_field\"]) " +
                "|> sort(columns: [\"_time\"]) " +
                "|> last()";

        List<FluxTable> tables = influxDBClient.getQueryApi().query(query, org);
        Map<String, Object> resultado = new HashMap<>();
        for (FluxTable table : tables) {
            for (FluxRecord record : table.getRecords()) {
                String sensor = record.getField();
                Object valor = record.getValue();

                if (sensor != null) {
                    resultado.put(sensor, valor);
                }
            }
        }
        return resultado;
    }

    // HISTORICO
    public Map<String, List<Map<String, Object>>> buscarHistoricoMedicoes(String periodo) {
        if (periodo == null || !periodo.matches("^[0-9]+[hdw]$")) {
            periodo = "24h";
        }

        int tailLimit;
        switch (periodo) {
            case "1h":
                tailLimit = 60;
                break;
            case "7d":
                tailLimit = 200;
                break;
            default:
                tailLimit = 120;
                break;
        }

        String query = "from(bucket: \"" + bucket + "\") " +
                "|> range(start: -" + periodo + ") " +
                "|> filter(fn: (r) => r[\"_measurement\"] == \"mqtt_consumer\") " +
                "|> group(columns: [\"_field\"]) " +
                "|> sort(columns: [\"_time\"]) " +
                "|> tail(n: " + tailLimit + ")";

        List<FluxTable> tables = influxDBClient.getQueryApi().query(query, org);

        Map<String, List<Map<String, Object>>> resultado = new HashMap<>();

        for (FluxTable table : tables) {
            for (FluxRecord record : table.getRecords()) {
                String sensor = record.getField();
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