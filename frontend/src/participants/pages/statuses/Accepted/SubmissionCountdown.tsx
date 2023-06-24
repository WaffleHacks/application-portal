import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';

const SUBMISSION_DEADLINE = '2023-06-25T12:00:00.000-04:00';

const SubmissionCountdown = (): JSX.Element => {
  const [{ hours, minutes, seconds }, setUntil] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const deadline = DateTime.fromISO(SUBMISSION_DEADLINE).toLocal();

    const ticker = setInterval(() => {
      const difference = deadline.diffNow(['hours', 'minutes', 'seconds']);

      setUntil({
        hours: difference.hours,
        minutes: difference.minutes,
        seconds: Math.floor(difference.seconds),
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, []);

  if (seconds < 0) return <p className="text-xl text-red-500">Submissions are now closed!</p>;

  return (
    <div className="text-xl text-center">
      Submissions due in:&nbsp;
      <span className="text-2xl">
        {hours} hr, {minutes} min, {seconds} sec
      </span>
    </div>
  );
};

export default SubmissionCountdown;
