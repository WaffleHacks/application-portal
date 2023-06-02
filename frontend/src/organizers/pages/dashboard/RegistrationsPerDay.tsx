import { ArrowPathIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { axisBottom, axisLeft, bisectCenter, curveBumpX, line, max, pointer, scaleLinear, scaleUtc, select } from 'd3';
import { DateTime, Interval } from 'luxon';
import React, { useEffect, useId, useRef, useState } from 'react';
import DatePicker from 'react-flatpickr';

import { StatisticEntry, useGetPerDayRegistrationStatisticsQuery } from 'store';

import { IconWithLabel } from './ChartContainer';

const HEIGHT = 700;
const WIDTH = 1600;
const MARGIN_TOP = 20;
const MARGIN_RIGHT = 30;
const MARGIN_LEFT = 40;
const MARGIN_BOTTOM = 30;

interface ContainerProps {
  className?: string;
}

const Container = ({ className }: ContainerProps): JSX.Element => {
  const [endDate, setEndDate] = useState(() => DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }));
  const [startDate, setStartDate] = useState(() => endDate.minus({ month: 1 }));
  const { data = [], isLoading } = useGetPerDayRegistrationStatisticsQuery({
    start: startDate.toISO() ?? undefined,
    end: endDate.toISO() ?? undefined,
  });

  let component;
  if (isLoading) component = <IconWithLabel text="Loading..." className="animate-spin" icon={ArrowPathIcon} />;
  else if (data.length === 0) component = <IconWithLabel text="No data yet" icon={QuestionMarkCircleIcon} />;
  else component = <Chart data={data} start={startDate} end={endDate} />;

  return (
    <div className={className}>
      <div className="flex">
        <p className="flex-1 w-full text-center mt-1 mb-3 text-xl text-gray-800">Registrations per Day</p>
        <DatePicker
          options={{
            mode: 'range',
            altInput: true,
            altFormat: 'F j, Y',
            dateFormat: 'Y-m-d',
            defaultDate: [startDate.toISODate(), endDate.toISODate()] as string[],
          }}
          onChange={(dates) => {
            if (dates.length !== 2) return;
            setStartDate(DateTime.fromJSDate(dates[0]));
            setEndDate(DateTime.fromJSDate(dates[1]));
          }}
          value={[startDate.toJSDate(), endDate.toJSDate()]}
        />
      </div>
      {component}
    </div>
  );
};

interface ChartProps {
  data: StatisticEntry[];
  start: DateTime;
  end: DateTime;
}

const Chart = ({ data, start, end }: ChartProps): JSX.Element => {
  const id = useId();
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (ref.current === null) return;

    // Clear the current SVG before re-rendering
    ref.current.replaceChildren();

    const definedData = Object.fromEntries(data.map((d) => [d.label, d.count]));
    const dateRange = Interval.fromDateTimes(start, end)
      .splitBy({ day: 1 })
      .map((d) => d.end as DateTime);

    const X = Interval.fromDateTimes(start, end)
      .splitBy({ day: 1 })
      .map((d) => (d.end as DateTime).toJSDate());
    const Y = dateRange.map((date) => definedData[date.toISODate() as string] || 0);
    const I = dateRange.map((_, i) => i);

    const xScale = scaleUtc([start.toJSDate(), end.toJSDate()], [MARGIN_LEFT, WIDTH - MARGIN_RIGHT]);
    const xAxis = axisBottom(xScale)
      .ticks(WIDTH / 80)
      .tickSizeOuter(0);

    const yScale = scaleLinear([0, (max(Y) || 0) + 1], [HEIGHT - MARGIN_BOTTOM, MARGIN_TOP]);
    const yAxis = axisLeft(yScale).ticks(HEIGHT / 40);

    const formatDate = xScale.tickFormat(undefined, '%b %-d, %Y');
    const title = (i: number): string => `${formatDate(X[i])}\n${Y[i]}`;

    const lineGenerator = line<number>()
      .curve(curveBumpX)
      .x((i) => xScale(X[i]))
      .y((i) => yScale(Y[i]));

    const svg = select(ref.current)
      .attr('width', WIDTH)
      .attr('height', HEIGHT)
      .attr('viewBox', [0, 0, WIDTH, HEIGHT])
      .attr('style', 'max-width: 100%; height: auto; height: intrinsic;')
      .attr('font-family', 'san-serif')
      .attr('font-size', 10)
      .style('-webkit-tap-highlight-color', 'transparent')
      .style('overflow', 'visible')
      .on('pointerenter pointermove', onPointerMoved)
      .on('pointerleave', onPointerLeft)
      .on('touchstart', (event: TouchEvent) => event.preventDefault());

    svg
      .append('g')
      .attr('transform', `translate(0, ${HEIGHT - MARGIN_BOTTOM})`)
      .call(xAxis);

    svg
      .append('g')
      .attr('transform', `translate(${MARGIN_LEFT}, 0)`)
      .call(yAxis)
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .selectAll('.tick line')
          .clone()
          .attr('x2', WIDTH - MARGIN_LEFT - MARGIN_RIGHT)
          .attr('stroke-opacity', 0.15),
      )
      .call((g) =>
        g
          .append('text')
          .attr('x', -MARGIN_LEFT)
          .attr('y', 5)
          .attr('fill', 'currentColor')
          .attr('text-anchor', 'start')
          .text('↑ Participants'),
      );

    svg
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', lineGenerator(I));

    const tooltip = svg.append('g').style('pointer-events', 'none');

    function onPointerMoved(event: PointerEvent) {
      const i = bisectCenter(X, xScale.invert(pointer(event)[0]));
      tooltip.style('display', null);
      tooltip.attr('transform', `translate(${xScale(X[i])}, ${yScale(Y[i])})`);

      const path = tooltip
        .selectAll('path')
        .data([undefined, undefined])
        .join('path')
        .attr('fill', 'white')
        .attr('stroke', 'black');

      const text = tooltip
        .selectAll('text')
        .data([undefined, undefined])
        .join('text')
        .call((text) =>
          text
            .selectAll('tspan')
            .data(`${title(i)}`.split(/\n/))
            .join('tspan')
            .attr('x', 0)
            .attr('y', (_, i) => `${i * 1.1}em`)
            .text((d) => d),
        );

      const { y, width: w, height: h } = (text.node() as SVGTextElement).getBBox();
      text.attr('transform', `translate(${-w / 2}, ${15 - y})`);
      path.attr('d', `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`);
    }

    function onPointerLeft() {
      tooltip.style('display', 'none');
    }
  }, [data, start, end, ref]);

  return <svg id={id} ref={ref} />;
};

export default Container;
