(function () {
  document.querySelectorAll('.week-group > summary').forEach(function (summary) {
    summary.addEventListener('click', function (e) {
      // Only toggle children if clicking the summary itself (not a link inside)
      if (e.target.closest('a')) return;
      var week = summary.parentElement;
      var days = week.querySelectorAll('.day-group');
      if (days.length === 0) return;
      // After the browser toggles the week, sync all child days
      requestAnimationFrame(function () {
        var open = week.open;
        days.forEach(function (day) { day.open = open; });
      });
    });
  });
})();
