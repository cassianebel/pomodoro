import * as dateFns from "date-fns";

const CompletedSessions = ({ sessions }) => {
  const today = new Date();
  const dailyPomodoros = sessions.filter(
    (session) =>
      new Date(session.timestamp).toDateString() === today.toDateString()
  );

  const startOfWeek = dateFns.startOfWeek(today);
  const endOfWeek = dateFns.endOfWeek(today);
  const weeklyPomodoros = sessions.filter(
    (session) =>
      new Date(session.timestamp) >= startOfWeek &&
      new Date(session.timestamp) <= endOfWeek
  );

  const monthlyPomodoros = sessions.filter(
    (session) =>
      new Date(session.timestamp).getMonth() === today.getMonth() &&
      new Date(session.timestamp).getFullYear() === today.getFullYear()
  );

  const yearlyPomodoros = sessions.filter(
    (session) =>
      new Date(session.timestamp).getFullYear() === today.getFullYear()
  );

  return (
    <div className="mx-14 my-7">
      <h1 className="font-display text-2xl text-center">Pomodoros Completed</h1>
      <div className="flex items-center gap-14 text-center leading-none">
        <p>
          <span className="font-display text-2xl">{dailyPomodoros.length}</span>
          <br />
          Today
        </p>
        <p>
          <span className="font-display text-2xl">
            {weeklyPomodoros.length}
          </span>
          <br />
          Week
        </p>
        <p>
          <span className="font-display text-2xl">
            {monthlyPomodoros.length}
          </span>
          <br />
          {dateFns.format(today, "MMMM")}
        </p>
        <p>
          <span className="font-display text-2xl">
            {yearlyPomodoros.length}
          </span>
          <br />
          {dateFns.format(today, "yyyy")}
        </p>
      </div>
    </div>
  );
};

export default CompletedSessions;
