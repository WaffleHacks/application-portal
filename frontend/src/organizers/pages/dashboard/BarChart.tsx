import { axisBottom, axisLeft, groupSort, scaleBand, scaleLinear, select } from 'd3';
import React, { useEffect, useId, useRef } from 'react';

import { ChartProps } from './ChartContainer';

const HEIGHT = 700;
const MARGIN_TOP = 30;
const MARGIN_RIGHT = 0;
const MARGIN_BOTTOM = 30;
const MARGIN_LEFT = 40;

const BarChart = ({ data, width }: ChartProps): JSX.Element => {
  const id = useId();
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (ref.current === null) return;

    // Clear the current SVG before re-drawing
    ref.current.replaceChildren();

    const x = scaleBand()
      .domain(
        groupSort(
          data,
          ([d]) => parseInt(d.label),
          (d) => d.label,
        ),
      )
      .range([MARGIN_LEFT, width - MARGIN_RIGHT])
      .padding(0.1);
    const y = scaleLinear()
      .domain([0, Math.max(...data.map((d) => d.count))])
      .range([HEIGHT - MARGIN_BOTTOM, MARGIN_TOP]);

    const svg = select(ref.current)
      .attr('width', width)
      .attr('height', HEIGHT)
      .attr('viewBox', [0, 0, width, HEIGHT])
      .style('max-width', '100%')
      .style('height', 'auto');

    // Add a rect for each bar
    svg
      .append('g')
      .attr('fill', 'steelblue')
      .selectAll()
      .data(data)
      .join('rect')
      .attr('x', (d) => x(d.label) || null)
      .attr('y', (d) => y(d.count))
      .attr('height', (d) => y(0) - y(d.count))
      .attr('width', x.bandwidth());

    // Add the x-axis labels
    svg
      .append('g')
      .attr('transform', `translate(0, ${HEIGHT - MARGIN_BOTTOM})`)
      .call(axisBottom(x).tickSizeOuter(0));

    // Add the y-axis labels
    svg
      .append('g')
      .attr('transform', `translate(${MARGIN_LEFT}, 0)`)
      .call(axisLeft(y))
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .append('text')
          .attr('x', -MARGIN_LEFT)
          .attr('y', 10)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'start')
          .text('↑ Occurrences'),
      );
  }, [data, ref]);

  return <svg id={id} ref={ref} />;
};

export default BarChart;
