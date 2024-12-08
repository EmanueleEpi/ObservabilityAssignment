const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { trace } = require("@opentelemetry/api");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");

// Instrumentations
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");

module.exports = (serviceName) => {
    // Configure the Jaeger Exporter
    const jaegerExporter = new JaegerExporter({
        endpoint: "http://localhost:14268/api/traces", // Default Jaeger endpoint for traces
    });

    // Set up the Tracer Provider
    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName, // Name of your service
        }),
    });

    // Add the Jaeger Exporter to the Span Processor
    provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));

    // Register the provider
    provider.register();

    // Register instrumentations for HTTP, Express, and MongoDB
    registerInstrumentations({
        instrumentations: [
            new HttpInstrumentation(),
            new ExpressInstrumentation(),
            new MongoDBInstrumentation(),
        ],
        tracerProvider: provider,
    });

    return trace.getTracer(serviceName);
};
