import os
import logging
from opentelemetry import trace
from opentelemetry._logs import set_logger_provider
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
from opentelemetry.sdk.resources import Resource, SERVICE_NAME
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.otlp.proto.grpc._log_exporter import OTLPLogExporter

logger = logging.getLogger("recon_memory.otel")

def init_tracer(service_name: str = "recon-memory-service") -> trace.Tracer:
    """
    Initializes OpenTelemetry TracerProvider and LoggerProvider pointing to SigNoz.
    If already initialized, returns existing tracer.
    """
    if isinstance(trace.get_tracer_provider(), TracerProvider):
        return trace.get_tracer("recon.ai")
    
    endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "localhost:4317").replace("http://", "").replace("https://", "")
    
    resource = Resource(attributes={
        SERVICE_NAME: service_name,
        "environment": "development",
        "team": "agents-of-signoz"
    })
    
    # ─── 1. Setup TracerProvider ────────────────────────────────────────────────
    provider = TracerProvider(resource=resource)
    try:
        otlp_exporter = OTLPSpanExporter(endpoint=endpoint, insecure=True)
        processor = BatchSpanProcessor(otlp_exporter)
        provider.add_span_processor(processor)
        trace.set_tracer_provider(provider)
        logger.info(f"OpenTelemetry TracerProvider initialized pointing to {endpoint}")
    except Exception as e:
        logger.warning(f"Failed to setup OTLPSpanExporter: {e}. Tracing will be local/noop.")
        trace.set_tracer_provider(provider)
        
    # ─── 2. Setup LoggerProvider ────────────────────────────────────────────────
    try:
        logger_provider = LoggerProvider(resource=resource)
        set_logger_provider(logger_provider)
        otlp_log_exporter = OTLPLogExporter(endpoint=endpoint, insecure=True)
        logger_provider.add_log_record_processor(BatchLogRecordProcessor(otlp_log_exporter))
        
        # Attach to python logging via LoggingHandler
        handler = LoggingHandler(level=logging.INFO, logger_provider=logger_provider)
        logging.getLogger().addHandler(handler)
        logger.info(f"OpenTelemetry LoggerProvider and LoggingHandler initialized (level=INFO) pointing to {endpoint}")
    except Exception as e:
        logger.warning(f"Failed to setup OTLPLogExporter: {e}. Logging will remain console-only.")
        
    return trace.get_tracer("recon.ai")

tracer = init_tracer()

