# LLM Benchmarks

A research area and a playground for experimentation. Each study here tests how language models and agents behave when they do design work: how they name things, what they assume, where they agree with each other and where they do not. The aim is to replace guesses about agent behaviour with measurements that anyone can rerun.

## Studies

| Study | Question | Status | Report |
|---|---|---|---|
| [Token Naming Instinct](studies/2026-10-token-naming/) | When five models name the same 500 design tokens blind, which names do they agree on? | Complete | [HTML](reports/2026-10-token-naming/report.html) · [Dataset](reports/2026-10-token-naming/dataset.zip) |

## Layout

```
studies/    one folder per study, dated. Prompts, raw responses, scripts, notes, whatever the study needs.
reports/    the published output of each study: the report and a dataset archive
```

Studies differ in method and structure. Read each study's own README before using its data.

## Use the data

Everything is here to be reused. Download the raw responses, the frozen prompts and the derived data from a study's folder, or take the zipped dataset from `reports/`, and use them as you see fit: rerun the analysis, test other models against the same prompts, or build on the findings. The only condition is credit.

## Licence and citation

Everything in this repository is licensed under [CC BY 4.0](LICENSE). Reuse it as you like, with credit.

To cite a study: John Fraskos, *Token Naming Instinct*, LLM Benchmarks, 2026. Link to the study folder.

## About

These studies come out of building [Delta](https://deltatheme.com), a WordPress theme that agents work on directly. Questions that came up while making agents build and style sites turn into the experiments here.
