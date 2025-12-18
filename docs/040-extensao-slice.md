# Extensão 3MF Slice (Opcional)

A extensão Slice descreve fatias/layers e pode ser usada por alguns slicers para otimizações.

**Namespace oficial**: `http://schemas.microsoft.com/3dmanufacturing/slice/2015/07` (prefixo `s:`)

**IMPORTANTE para Bambu Studio**: O Bambu Studio **IGNORA** a extensão Slice e sempre recalcula as fatias internamente. **NÃO é necessário** incluir esta extensão para compatibilidade com Bambu Studio. Use apenas se houver necessidade específica de interoperabilidade com outros softwares que a consumam.

## Quando considerar
- Você precisa transportar informações de slicing pré-calculadas
- Interoperar com pipelines que exigem geometria 2D por layer

## Conceitos
- `s:slices` como container
- `s:slice` com `zbottom` e lista de polígonos
- `s:refslices` para reuso

## Riscos
- Aumenta o tamanho do arquivo
- Pode conflitar com recalculadores de slice do slicer alvo

## Checklist (Slice)
- [ ] Namespace `s` declarado: `xmlns:s="http://schemas.microsoft.com/3dmanufacturing/slice/2015/07"`
- [ ] Estruturas `s:slices` válidas
- [ ] Coerência com a geometria 3D subjacente

**Nota**: Esta extensão é **desnecessária para Bambu Studio** e pode ser omitida.
