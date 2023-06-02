import {
  PieArcDatum,
  arc,
  format,
  interpolateSpectral,
  pie,
  quantize,
  range,
  scaleOrdinal,
  schemeSpectral,
  select,
} from 'd3';
import React, { useEffect, useId, useRef } from 'react';

import { ChartProps } from './ChartContainer';

const HEIGHT = 400;

const PieChart = ({ data, width }: ChartProps): JSX.Element => {
  const id = useId();
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (ref.current === null) return;

    // Clear the current SVG before re-drawing
    ref.current.replaceChildren();

    const radius = Math.min(width, HEIGHT) / 2;
    const labelRadius = radius * 0.75;

    const labels = data.map((entry) => entry.label);
    const values = data.map((entry) => entry.count);
    const indices = range(labels.length).filter((i) => !isNaN(values[i]));

    const formatValue = format(',');
    const title = (i: number) => `${labels[i]}\n${formatValue(values[i])}`;

    // Construct colors
    const scheme = generateColorScheme(labels.length);
    const color = scaleOrdinal(labels, scheme);

    // Construct arcs
    const arcs = pie<number>()
      .padAngle(0)
      .sort(null)
      .value((i) => values[i])(indices);
    const arcGenerator = arc<PieArcDatum<number>>().innerRadius(0).outerRadius(radius);
    const labelArcGenerator = arc<PieArcDatum<number>>().innerRadius(labelRadius).outerRadius(labelRadius);

    const svg = select(ref.current)
      .attr('width', width)
      .attr('height', HEIGHT)
      .attr('viewBox', [-width / 2, -HEIGHT / 2, width, HEIGHT])
      .attr('style', 'max-width: 100%; height: auto; height: intrinsic;');

    svg
      .append('g')
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .attr('stroke-linejoin', 'round')
      .selectAll('path')
      .data(arcs)
      .join('path')
      .attr('fill', (d) => color(labels[d.data]))
      .attr('d', arcGenerator)
      .append('title')
      .text((d) => title(d.data));

    svg
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'middle')
      .selectAll('text')
      .data(arcs)
      .join('text')
      .attr('transform', (d) => `translate(${labelArcGenerator.centroid(d)})`)
      .selectAll('tspan')
      .data((d) => {
        const lines = `${title(d.data)}`.split(/\n/);
        return d.endAngle - d.startAngle > 0.25 ? lines : lines.slice(0, 1);
      })
      .join('tspan')
      .attr('x', 0)
      .attr('y', (_, i) => `${i * 1.1}em`)
      .attr('font-weight', (_, i) => (i ? null : 'bold'))
      .text((d) => d);
  }, [ref, data]);

  return <svg id={id} ref={ref} />;
};

/**
 * Uses a pre-generated spectral color scheme or interpolates a new one
 * @param size the number of colors needed
 * @returns a color scheme
 */
const generateColorScheme = (size: number): readonly string[] => {
  if (size === 1) return ['#a9a9da'];

  const spectral = schemeSpectral[size];
  if (spectral) return spectral;

  return quantize((t) => interpolateSpectral(t * 0.8 + 0.1), size);
};

export default PieChart;
