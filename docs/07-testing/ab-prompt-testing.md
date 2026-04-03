# A/B Prompt Testing
## Habbit Tracker — AI Prompt Optimization

> **Version:** 1.0 | **Last updated:** March 2026

## Scope

Applies to optional AI setup/insight prompts in `docs/03-ai-agent/prompt-library.md`.

## Process

1. Select baseline prompt
2. Create candidate variant
3. Run offline eval set
4. Compare quality + safety + parse reliability
5. Promote only if thresholds are met

## Metrics

- Relevance score
- Actionability score
- Safety violation count
- JSON/schema parse success
- User edit rate after suggestion

## Promotion Rule

Candidate prompt is accepted only if:
- Equal or better safety
- Equal or better parse reliability
- Measurably better relevance or actionability

