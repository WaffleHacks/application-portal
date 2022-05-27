from opentelemetry.instrumentation.botocore import (
    BotocoreInstrumentor,
    _determine_call_context,
)


class FilteredBotocoreInstrumentor(BotocoreInstrumentor):
    def _instrument(self, **kwargs):
        self.excluded = set(kwargs.get("excluded", []))
        super(FilteredBotocoreInstrumentor, self)._instrument(**kwargs)

    def _patched_api_call(self, original_func, instance, args, kwargs):
        call_context = _determine_call_context(instance, args)
        if call_context is None:
            return original_func(*args, **kwargs)

        if f"{call_context.service_id}.{call_context.operation}" in self.excluded:
            return original_func(*args, **kwargs)

        return super(FilteredBotocoreInstrumentor, self)._patched_api_call(
            original_func, instance, args, kwargs
        )
