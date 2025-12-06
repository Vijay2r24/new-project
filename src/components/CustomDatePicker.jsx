import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import {
  MONTHS,
  WEEK_DAYS,
  STYLES,
  DATE_FORMATS,
  DATE_UNITS,
  QUICK_FILTER_VALUES,
  QUICK_FILTER_LABELS,
} from "../contants/constants";
import { useTranslation } from "react-i18next"

function DateTimeRangePickerComponent({
  dateRange,
  setDateRange,
  displayText,
  handleClearDates,
  
  maxDate,
  minDate,
  allowFutureDates = true,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [tempRange, setTempRange] = useState({ start: null, end: null });
const { t } = useTranslation();
  // Set endTime to current time by default
  const [timeRange, setTimeRange] = useState({
    startTime: dayjs().subtract(1, DATE_UNITS.HOUR).format(DATE_FORMATS.time),
    endTime: dayjs().format(DATE_FORMATS.time), // Current time as default for end
  });

  const [view, setView] = useState(DATE_UNITS.DAYS);
  const [validationError, setValidationError] = useState(null);
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
        setView(DATE_UNITS.DAYS);
        setValidationError(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!dateRange.start && !dateRange.end) {
      // Reset to current time for end when no date range is selected
      setTimeRange({
        startTime: dayjs().subtract(1, DATE_UNITS.HOUR).format(DATE_FORMATS.time),
        endTime: dayjs().format(DATE_FORMATS.time), // Current time for end
      });
      setTempRange({ start: null, end: null });
    }
  }, [dateRange]);

  const validateTime = (time) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const validateDateRange = (start, end) => {
    if (!start || !end) {
      return { type: "range", message: t("VALIDATION.SELECT_BOTH_DATES") };
    }

    if (!start.isValid() || !end.isValid()) {
      return { type: "date", message: t("VALIDATION.INVALID_DATE") };
    }

    if (end.isBefore(start)) {
      return { type: "range", message: t("VALIDATION.END_BEFORE_START") };
    }

    if (!allowFutureDates && start.isAfter(dayjs(), DATE_UNITS.DAY)) {
      return { type: "date", message: t("VALIDATION.NO_FUTURE_DATES") };
    }

    if (minDate && start.isBefore(minDate, DATE_UNITS.DAY)) {
      return {
        type: "date",
        message: t("VALIDATION.MIN_DATE", {
          date: minDate.format(DATE_FORMATS.DATE_DISPLAY),
        }),
      };
    }

    if (maxDate && end.isAfter(maxDate, DATE_UNITS.DAY)) {
      return {
        type: "date",
        message: t("VALIDATION.MAX_DATE", {
          date: maxDate.format(DATE_FORMATS.DATE_DISPLAY),
        }),
      };
    }

    const daysDiff = end.diff(start, DATE_UNITS.DAY);
    if (daysDiff > 365) {
      return { type: "range", message: t("VALIDATION.MAX_RANGE_365") };
    }

    return null;
  };

  const validateTimeRange = (startTime, endTime, startDate, endDate) => {
    if (!validateTime(startTime) || !validateTime(endTime)) {
      return { type: "time", message: t("VALIDATION.INVALID_TIME_FORMAT") };
    }

    if (startDate.isSame(endDate, DATE_UNITS.DAY)) {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        return { type: "time", message: t("VALIDATION.END_TIME_AFTER_START") };
      }
    }

    return null;
  };

  const handleQuickFilterSelection = (filterValue) => {
    setValidationError(null);
    const now = dayjs();
    let start, end;

    let startTime = dayjs().subtract(1, DATE_UNITS.HOUR).format(DATE_FORMATS.time);
    let endTime = dayjs().format(DATE_FORMATS.time); // ALWAYS current time for end

    switch (filterValue) {
      case "last3hours":
        start = now.subtract(3, DATE_UNITS.HOUR);
        end = now;
        startTime = start.format(DATE_FORMATS.time);
        break;

      case "last6hours":
        start = now.subtract(6, DATE_UNITS.HOUR);
        end = now;
        startTime = start.format(DATE_FORMATS.time);
        break;

      case "last12hours":
        start = now.subtract(12, DATE_UNITS.HOUR);
        end = now;
        startTime = start.format(DATE_FORMATS.time);
        break;

      case "last24hours":
        start = now.subtract(24, DATE_UNITS.HOUR);
        end = now;
        startTime = start.format(DATE_FORMATS.time);
        break;

      case "last2days":
        start = now.subtract(2, DATE_UNITS.DAY).startOf("day");
        end = now;
        startTime = "00:00";
        break;

      case "last7days":
        start = now.subtract(7, DATE_UNITS.DAY).startOf("day");
        end = now;
        startTime = "00:00";
        break;

      default:
        start = now.subtract(3, DATE_UNITS.HOUR);
        end = now;
    }

    const error = validateDateRange(start, end);
    if (error) {
      setValidationError(error);
      return;
    }

    setDateRange({ start, end });
    setTimeRange({ startTime, endTime });
    setTempRange({
      start: start.startOf(DATE_UNITS.DAY),
      end: end.startOf(DATE_UNITS.DAY),
    });
    setSelectedMonth(start);
    setShowDropdown(false);
  };

const filteredQuickFilters = QUICK_FILTER_VALUES.map((value, index) => ({
  value,
  label: QUICK_FILTER_LABELS[index],
}));

  const startOfMonth = selectedMonth.startOf("month");
  const endOfMonth = selectedMonth.endOf("month");
  const startDay = startOfMonth.day();
  const daysInMonth = endOfMonth.date();

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const currentYear = dayjs().year();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const isDateDisabled = (date) => {
    if (!allowFutureDates && date.isAfter(dayjs(), DATE_UNITS.DAY)) {
      return true;
    }
    if (minDate && date.isBefore(minDate, DATE_UNITS.DAY)) {
      return true;
    }
    if (maxDate && date.isAfter(maxDate, DATE_UNITS.DAY)) {
      return true;
    }
    return false;
  };

  const handleDateClick = (day) => {
    if (!day) return;

    const clickedDate = selectedMonth.date(day);

    if (isDateDisabled(clickedDate)) {
      setValidationError({
        type: "date",
        message: t("VALIDATION.DATE_NOT_SELECTABLE"),
      });
      return;
    }

    setValidationError(null);

    if (!tempRange.start || (tempRange.start && tempRange.end)) {
      setTempRange({ start: clickedDate, end: null });
    } else if (clickedDate.isBefore(tempRange.start, DATE_UNITS.DAY)) {
      setTempRange({ start: clickedDate, end: tempRange.start });
    } else {
      const error = validateDateRange(tempRange.start, clickedDate);
      if (error) {
        setValidationError(error);
        return;
      }
      setTempRange({ ...tempRange, end: clickedDate });
    }
  };

  const handleMonthSelect = (monthIndex) => {
    setSelectedMonth(selectedMonth.month(monthIndex));
    setView(DATE_UNITS.DAYS);
  };

  const handleYearSelect = (year) => {
    setSelectedMonth(selectedMonth.year(year));
    setView("months");
  };

  const handleTimeChange = (type, value) => {
    const newTimeRange = {
      ...timeRange,
      [type === "start" ? "startTime" : "endTime"]: value,
    };

    if (!validateTime(value)) {
      setValidationError({
        type: "time",
        message: t("VALIDATION.INVALID_TIME_FORMAT"),
      });
      return;
    }

    setValidationError(null);
    setTimeRange(newTimeRange);
  };

  const applyDateRange = () => {
    if (!tempRange.start || !tempRange.end) {
      setValidationError({
        type: "range",
        message: t("VALIDATION.SELECT_BOTH_DATES"),
      });
      return;
    }

    const dateError = validateDateRange(tempRange.start, tempRange.end);
    if (dateError) {
      setValidationError(dateError);
      return;
    }

    const timeError = validateTimeRange(
      timeRange.startTime,
      timeRange.endTime,
      tempRange.start,
      tempRange.end
    );
    if (timeError) {
      setValidationError(timeError);
      return;
    }

    const [startHour, startMin] = timeRange.startTime.split(":").map(Number);
    const [endHour, endMin] = timeRange.endTime.split(":").map(Number);

    const finalStart = dayjs(tempRange.start)
      .hour(startHour)
      .minute(startMin)
      .second(0);
    const finalEnd = dayjs(tempRange.end)
      .hour(endHour)
      .minute(endMin)
      .second(59);

    setDateRange({ start: finalStart, end: finalEnd });
    setShowCalendar(false);
    setView(DATE_UNITS.DAYS);
    setValidationError(null);
  };

  const handleClearAll = () => {
    handleClearDates();
    // Reset to current time for end when clearing
    setTimeRange({
      startTime: dayjs().subtract(1, DATE_UNITS.HOUR).format(DATE_FORMATS.time),
      endTime: dayjs().format(DATE_FORMATS.time), // Current time for end
    });
    setTempRange({ start: null, end: null });
    setValidationError(null);
  };

  const renderDaysView = () => (
    <>
      <div className="flex justify-between items-center mb-1">
        <button
          onClick={() => setSelectedMonth(selectedMonth.subtract(1, "month"))}
          className="p-0.5 hover:bg-gray-100 rounded-full"
          aria-label={t("PREVIOUS_MONTH")}
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => setView("months")}
          className="font-semibold text-gray-700 hover:bg-gray-100 px-2 py-0.5 rounded text-xs"
        >
          {MONTHS[selectedMonth.month()]} {selectedMonth.year()}
        </button>
        <button
          onClick={() => setSelectedMonth(selectedMonth.add(1, "month"))}
          className="p-0.5 hover:bg-gray-100 rounded-full"
          aria-label={t("NEXT_MONTH")}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 text-xs font-semibold text-gray-500 mb-1">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-xs">
        {days.map((day, idx) => {
          if (!day) {
            return <div key={idx} className="invisible h-5" />;
          }

          const current = dayjs(selectedMonth).date(day);
          const isDisabled = isDateDisabled(current);
          const isSelected =
            tempRange.start &&
            tempRange.end &&
            current.isAfter(tempRange.start, DATE_UNITS.DAY) &&
            current.isBefore(tempRange.end, DATE_UNITS.DAY);
          const isStart = tempRange.start?.isSame(current, DATE_UNITS.DAY);
          const isEnd = tempRange.end?.isSame(current, DATE_UNITS.DAY);

          return (
            <div
              key={idx}
              className={`h-5 flex items-center justify-center rounded text-xs font-medium
                ${
                  isDisabled
                    ? "text-gray-300 cursor-not-allowed"
                    : isStart || isEnd
                    ? "bg-blue-500 text-white cursor-pointer"
                    : isSelected
                    ? "bg-blue-100 text-blue-600 cursor-pointer"
                    : "hover:bg-gray-100 text-gray-700 cursor-pointer"
                }`}
              onClick={() => !isDisabled && handleDateClick(day)}
            >
              {day}
            </div>
          );
        })}
      </div>
    </>
  );

  const renderMonthsView = () => (
    <>
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setSelectedMonth(selectedMonth.subtract(1, "year"))}
          className="p-0.5 hover:bg-gray-100 rounded-full"
          aria-label={t("PREVIOUS_YEAR")}
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => setView("years")}
          className="font-semibold text-gray-700 hover:bg-gray-100 px-2 py-0.5 rounded text-xs"
        >
          {selectedMonth.year()}
        </button>
        <button
          onClick={() => setSelectedMonth(selectedMonth.add(1, "year"))}
          className="p-0.5 hover:bg-gray-100 rounded-full"
          aria-label={t("NEXT_YEAR")}
        >
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {MONTHS.map((month, index) => (
          <button
            key={month}
            onClick={() => handleMonthSelect(index)}
            className={`p-1.5 text-xs rounded hover:bg-gray-100 font-medium ${
              selectedMonth.month() === index
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "text-gray-700"
            }`}
          >
            {month.slice(0, 3)}
          </button>
        ))}
      </div>
    </>
  );

  const renderYearsView = () => (
    <>
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setSelectedMonth(selectedMonth.subtract(10, "year"))}
          className="p-0.5 hover:bg-gray-100 rounded-full"
          aria-label={t("PREVIOUS_DECADE")}
        >
          <ChevronLeft size={14} />
        </button>
        <span className="font-semibold text-gray-700 text-xs">
          {years[0]} - {years[years.length - 1]}
        </span>
        <button
          onClick={() => setSelectedMonth(selectedMonth.add(10, "year"))}
          className="p-0.5 hover:bg-gray-100 rounded-full"
          aria-label={t("NEXT_DECADE")}
        >
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-1 max-h-40 overflow-y-auto">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => handleYearSelect(year)}
            className={`p-1.5 text-xs rounded hover:bg-gray-100 font-medium ${
              selectedMonth.year() === year
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "text-gray-700"
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    </>
  );

  const isDateSelected = dateRange.start && dateRange.end;

  return (
    <div className="relative" ref={calendarRef}>
      <button
        onClick={() => setShowDropdown((prev) => !prev)}
        className={`flex items-center justify-between gap-1.5 w-full px-2.5 py-1.5 border border-gray-300 rounded-md bg-white ${STYLES.backgroundColor.hover} transition-colors focus:outline-none ${STYLES.border.focus} h-full`}
        style={{ minWidth: "320px" }}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Calendar size={12} className={STYLES.textColor.secondary} />
          <span
            className="text-gray-700 whitespace-nowrap font-medium flex-1 text-left text-xs"
          >
            {displayText || t("SELECT_DATE_TIME")}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isDateSelected ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              className="p-0.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              title={t("CLEAR_DATE_RANGE")}
            >
              <X size={12} className="text-gray-500 hover:text-gray-700" />
            </button>
          ) : (
            <ChevronDown size={12} className={STYLES.textColor.secondary} />
          )}
        </div>
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {filteredQuickFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleQuickFilterSelection(filter.value)}
              className="w-full px-2.5 py-1.5 text-xs text-left hover:bg-gray-100 transition-colors font-medium"
              style={{ fontSize: "0.7rem" }}
            >
              {filter.label}
            </button>
          ))}

          <button
            onClick={() => {
              setShowCalendar(true);
              setShowDropdown(false);
              setValidationError(null);
            }}
            className="w-full px-2.5 py-1.5 text-left hover:bg-gray-100 border-t mt-1 font-medium"
            style={{ fontSize: "0.7rem" }}
          >
            📅 {t("SELECT_FROM_CALENDAR")}
          </button>
        </div>
      )}

      {showCalendar && (
        <div className="absolute z-50 mt-2 w-64 bg-white border border-gray-300 rounded-md shadow-lg p-2.5">
          {validationError && (
            <div className="mb-2.5 p-2 bg-red-50 border border-red-200 rounded-md flex items-start gap-1.5">
              <AlertCircle size={12} className="text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-red-600" style={{ fontSize: "0.7rem" }}>
                {validationError.message}
              </span>
            </div>
          )}

          {view === DATE_UNITS.DAYS && renderDaysView()}
          {view === "months" && renderMonthsView()}
          {view === "years" && renderYearsView()}

          <div className="flex items-center justify-between mt-2.5">
            <div className="flex flex-col text-gray-600">
              <label className="font-semibold mb-0.5" style={{ fontSize: "0.7rem" }}>
                {t("START_TIME")}
              </label>
              <input
                type="time"
                value={timeRange.startTime}
                onChange={(e) => handleTimeChange("start", e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 w-24"
                style={{ fontSize: "0.7rem" }}
              />
            </div>
            <div className="flex flex-col text-gray-600">
              <label className="font-semibold mb-0.5" style={{ fontSize: "0.7rem" }}>
                {t("END_TIME")}
              </label>
              <input
                type="time"
                value={timeRange.endTime}
                onChange={(e) => handleTimeChange("end", e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 w-24"
                style={{ fontSize: "0.7rem" }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2.5">
            <button
              onClick={() => {
                setShowCalendar(false);
                setView(DATE_UNITS.DAYS);
                setValidationError(null);
              }}
              className="px-2.5 py-1 rounded-md hover:bg-gray-100 text-gray-600 font-semibold"
              style={{ fontSize: "0.7rem" }}
            >
              {t("CANCEL")}
            </button>
            <button
              onClick={applyDateRange}
              className="px-2.5 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-semibold"
              style={{ fontSize: "0.7rem" }}
            >
              {t("APPLY")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateTimeRangePickerComponent;