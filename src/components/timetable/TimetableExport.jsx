import { useRef, useState, useMemo } from "react";
import html2canvas from "html2canvas";
import { Download, Plus, X } from "lucide-react";
import { formatTimeTo12Hour } from "../../utils/dateHelpers";
import { useApp } from "../../context/AppContext";
import TimetableSelector from "../courses/TimetableSelector";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
  "09:00",
  "09:45",
  "10:30",
  "11:15",
  "12:00",
  "12:45",
  "13:30",
  "14:15",
  "15:00",
  "15:45",
];

export default function TimetableExport({
  scheduleByDay,
  courses,
  onExportSuccess,
}) {
  const exportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTimetableSelector, setShowTimetableSelector] = useState(false);
  const [tempCourses, setTempCourses] = useState([]); // Temporary courses just for export

  // Convert time to minutes for comparison
  const timeToMinutes = (time) => {
    if (!time) return 0;
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + (minutes || 0);
  };

  // Convert 12-hour to 24-hour
  const convertTo24Hour = (time12) => {
    if (!time12) return "09:00";
    const [time, period] = time12.split(/\s*(AM|PM)/i);
    const [hours, minutes] = time.split(":").map(Number);
    let hour24 = hours;
    if (period?.toUpperCase() === "PM" && hours !== 12) hour24 += 12;
    if (period?.toUpperCase() === "AM" && hours === 12) hour24 = 0;
    return `${String(hour24).padStart(2, "0")}:${String(minutes || 0).padStart(2, "0")}`;
  };

  // Merge existing schedule with temporary courses for export
  const exportSchedule = useMemo(() => {
    // Start with a deep copy of scheduleByDay to avoid mutating the original
    const merged = {};
    DAYS.forEach((day) => {
      if (scheduleByDay && scheduleByDay[day]) {
        merged[day] = [...scheduleByDay[day]];
      }
    });

    // Track tempCourses entries separately to avoid cross-deduplication
    const tempCoursesEntries = [];

    // Add temporary courses to schedule
    tempCourses.forEach((course) => {
      // Handle courses with multiple sessions (multiple days)
      const schedule = course.schedule || [];

      if (schedule.length > 0) {
        // Multi-day course - add each session
        schedule.forEach((session) => {
          const day = session.day;
          if (!merged[day]) {
            merged[day] = [];
          }

          // Convert time to 12-hour format for display
          let startTime12 = session.startTime || "9:00 AM";
          let endTime12 = session.endTime || "10:00 AM";

          try {
            if (
              session.startTime &&
              !session.startTime.includes("AM") &&
              !session.startTime.includes("PM")
            ) {
              startTime12 = formatTimeTo12Hour(session.startTime);
            }
            if (
              session.endTime &&
              !session.endTime.includes("AM") &&
              !session.endTime.includes("PM")
            ) {
              endTime12 = formatTimeTo12Hour(session.endTime);
            }
          } catch (error) {
            console.warn("Error formatting time:", error);
          }

          tempCoursesEntries.push({
            courseName: course.name,
            courseCode: course.courseCode || course.name,
            section: course.section || "N/A",
            instructor: course.instructor || "TBA",
            room: session.room || course.room || "TBA",
            startTime: startTime12,
            endTime: endTime12,
            day: day,
            _isTempCourse: true, // Mark as temp course to avoid cross-deduplication
          });
        });
      } else {
        // Single day course
        const day = course.day || "Monday";
        if (!merged[day]) {
          merged[day] = [];
        }

        // Convert time to 12-hour format for display
        let startTime12 = course.startTime || "9:00 AM";
        let endTime12 = course.endTime || "10:00 AM";

        try {
          if (
            course.startTime &&
            !course.startTime.includes("AM") &&
            !course.startTime.includes("PM")
          ) {
            startTime12 = formatTimeTo12Hour(course.startTime);
          }
          if (
            course.endTime &&
            !course.endTime.includes("AM") &&
            !course.endTime.includes("PM")
          ) {
            endTime12 = formatTimeTo12Hour(course.endTime);
          }
        } catch (error) {
          console.warn("Error formatting time:", error);
        }

        tempCoursesEntries.push({
          courseName: course.name,
          courseCode: course.courseCode || course.name,
          section: course.section || "N/A",
          instructor: course.instructor || "TBA",
          room: course.room || "TBA",
          startTime: startTime12,
          endTime: endTime12,
          day: day,
          _isTempCourse: true, // Mark as temp course to avoid cross-deduplication
        });
      }
    });

    // Add tempCourses entries to merged schedule (they are independent)
    tempCoursesEntries.forEach((entry) => {
      const day = entry.day;
      if (!merged[day]) {
        merged[day] = [];
      }
      merged[day].push(entry);
    });

    // Sort all days by time and remove duplicates (but only within each source)
    DAYS.forEach((day) => {
      if (merged[day]) {
        // Separate main courses and temp courses
        const mainCourses = merged[day].filter((c) => !c._isTempCourse);
        const tempCourses = merged[day].filter((c) => c._isTempCourse);

        // Deduplicate within main courses only
        const mainSeen = new Set();
        const deduplicatedMain = mainCourses.filter((classInfo) => {
          const key = `${classInfo.courseCode}-${classInfo.section}-${classInfo.startTime}-${classInfo.endTime}`;
          if (mainSeen.has(key)) {
            return false;
          }
          mainSeen.add(key);
          return true;
        });

        // Deduplicate within temp courses only
        const tempSeen = new Set();
        const deduplicatedTemp = tempCourses.filter((classInfo) => {
          const key = `${classInfo.courseCode}-${classInfo.section}-${classInfo.startTime}-${classInfo.endTime}`;
          if (tempSeen.has(key)) {
            return false;
          }
          tempSeen.add(key);
          return true;
        });

        // Combine both (temp courses are independent, so they can duplicate main courses)
        merged[day] = [...deduplicatedMain, ...deduplicatedTemp];

        // Sort by time
        merged[day].sort((a, b) => {
          try {
            const timeA = timeToMinutes(
              a.startTime.includes("AM") || a.startTime.includes("PM")
                ? convertTo24Hour(a.startTime)
                : a.startTime,
            );
            const timeB = timeToMinutes(
              b.startTime.includes("AM") || b.startTime.includes("PM")
                ? convertTo24Hour(b.startTime)
                : b.startTime,
            );
            return timeA - timeB;
          } catch (error) {
            return 0;
          }
        });
      }
    });

    return merged;
  }, [scheduleByDay, tempCourses]);

  const handleExportClick = () => {
    // Show export modal first, allowing user to add more courses
    setShowExportModal(true);
  };

  const handleFinalExport = async () => {
    if (!exportRef.current) return;

    setIsExporting(true);
    setShowExportModal(false);

    try {
      // High quality export with 3x scale for crisp mobile viewing
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: "#1a1a1e",
        scale: 3, // Higher scale for better quality
        logging: false,
        useCORS: true,
        allowTaint: false,
        width: exportRef.current.scrollWidth,
        height: exportRef.current.scrollHeight,
        windowWidth: exportRef.current.scrollWidth,
        windowHeight: exportRef.current.scrollHeight,
      });

      // Create download link with high quality PNG
      const link = document.createElement("a");
      link.download = `timetable-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png", 1.0); // Maximum quality
      link.click();

      setIsExporting(false);
      if (onExportSuccess) {
        onExportSuccess();
      }
    } catch (error) {
      console.error("Export failed:", error);
      setIsExporting(false);
    }
  };

  // Handle courses selected from TimetableSelector (unrestricted mode)
  // IMPORTANT: These courses are NOT saved to the original timetable
  const handleCoursesSelected = (selectedCourses) => {
    // Convert selected courses to temporary format for export
    // These are NOT saved permanently, just for export
    const tempCoursesToAdd = selectedCourses.map((course) => {
      // Extract schedule information
      const schedule = course.schedule || [];
      const firstSession = schedule[0] || {};

      return {
        id: `temp-${Date.now()}-${Math.random()}-${course.courseCode}-${course.section}`,
        name: course.name,
        courseCode: course.courseCode || course.name,
        section: course.section || "N/A",
        instructor: course.instructor || "TBA",
        room: course.room || firstSession.room || "TBA",
        day: firstSession.day || "Monday",
        startTime: firstSession.startTime || "09:00",
        endTime: firstSession.endTime || "10:00",
        schedule: schedule, // Keep full schedule for multi-day courses
      };
    });

    // Remove duplicates before adding (check by courseCode + section)
    const existingKeys = new Set(
      tempCourses.map((c) => `${c.courseCode}-${c.section}`),
    );
    const newCourses = tempCoursesToAdd.filter((c) => {
      const key = `${c.courseCode}-${c.section}`;
      return !existingKeys.has(key);
    });

    setTempCourses([...tempCourses, ...newCourses]);
    setShowTimetableSelector(false);
  };

  const handleRemoveTempCourse = (id) => {
    setTempCourses(tempCourses.filter((c) => c.id !== id));
  };

  const totalCoursesForExport = courses.length + tempCourses.length;

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handleExportClick}
          disabled={isExporting || totalCoursesForExport === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-accent-hover text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Exporting..." : "Export as Image"}
        </button>
      </div>

      {/* Hidden export template - Vertical Layout */}
      <div ref={exportRef} className="fixed -left-[9999px] top-0">
        <div
          style={{
            width: "900px", // Optimized mobile width for better fit
            maxWidth: "900px",
            backgroundColor: "#0f172a",
            color: "#f1f5f9",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            padding: "40px",
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: "40px", textAlign: "center", borderBottom: "2px solid #334155", paddingBottom: "24px" }}>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#60a5fa",
                letterSpacing: "-0.3px",
              }}
            >
              Weekly Timetable
            </h1>
            <p
              style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "400", letterSpacing: "0.2px" }}
            >
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Compact Timetable - Days with combined courses */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {DAYS.map((day) => {
              const dayClasses = exportSchedule[day] || [];
              if (dayClasses.length === 0) return null;

              // Combine consecutive classes of the same course+section
              // First, ensure classes are sorted by time
              const sortedClasses = [...dayClasses].sort((a, b) => {
                try {
                  const timeA = timeToMinutes(
                    a.startTime.includes("AM") || a.startTime.includes("PM")
                      ? convertTo24Hour(a.startTime)
                      : a.startTime,
                  );
                  const timeB = timeToMinutes(
                    b.startTime.includes("AM") || b.startTime.includes("PM")
                      ? convertTo24Hour(b.startTime)
                      : b.startTime,
                  );
                  return timeA - timeB;
                } catch (error) {
                  return 0;
                }
              });

              const combinedClasses = [];
              for (let i = 0; i < sortedClasses.length; i++) {
                const current = sortedClasses[i];
                const prev = combinedClasses[combinedClasses.length - 1];

                if (!prev) {
                  // First class
                  combinedClasses.push({
                    ...current,
                    timeDisplay: `${current.startTime} - ${current.endTime}`,
                  });
                  continue;
                }

                // Normalize times for comparison (convert to 24-hour for accurate comparison)
                const prevEnd24 =
                  prev.endTime.includes("AM") || prev.endTime.includes("PM")
                    ? convertTo24Hour(prev.endTime)
                    : prev.endTime;
                const currentStart24 =
                  current.startTime.includes("AM") ||
                  current.startTime.includes("PM")
                    ? convertTo24Hour(current.startTime)
                    : current.startTime;

                // Check if this is a consecutive class of the same course+section
                // Match: same course, same section, same room, same instructor, and end time matches start time
                if (
                  prev.courseCode === current.courseCode &&
                  prev.section === current.section &&
                  prev.room === current.room &&
                  prev.instructor === current.instructor &&
                  prevEnd24 === currentStart24
                ) {
                  // Extend the time range - keep original startTime, update endTime
                  prev.endTime = current.endTime;
                  // Update the time display
                  prev.timeDisplay = `${prev.startTime} - ${current.endTime}`;
                } else {
                  // New class entry
                  combinedClasses.push({
                    ...current,
                    timeDisplay: `${current.startTime} - ${current.endTime}`,
                  });
                }
              }

              return (
                <div
                  key={day}
                  style={{
                    backgroundColor: "#1e293b",
                    borderRadius: "8px",
                    padding: "20px",
                    border: "1px solid #334155",
                    marginBottom: "20px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {/* Day Header */}
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#60a5fa",
                      marginBottom: "16px",
                      paddingBottom: "10px",
                      borderBottom: "2px solid #3b82f6",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {day.toUpperCase()}
                  </div>

                  {/* Compact Course List - All courses in one row/block */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {combinedClasses.map((classInfo, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: "#0f172a",
                          borderRadius: "6px",
                          padding: "18px 20px",
                          color: "#f1f5f9",
                          display: "flex",
                          flexDirection: "column",
                          gap: "14px",
                          minHeight: "auto",
                          width: "100%",
                          boxSizing: "border-box",
                          overflow: "visible",
                          border: "1px solid #334155",
                          borderLeft: "4px solid #3b82f6",
                          marginBottom: "12px",
                          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        {/* Left: Course Info */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "17px",
                              fontWeight: "600",
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              flexWrap: "wrap",
                              lineHeight: "1.5",
                            }}
                          >
                            <span
                              style={{
                                wordBreak: "break-word",
                                color: "#60a5fa",
                              }}
                            >
                              {classInfo.courseCode || classInfo.courseName}
                            </span>
                            {classInfo.section &&
                              classInfo.section !== "N/A" && (
                                <span
                                  style={{
                                    fontSize: "12px",
                                    
                                    padding: "4px 12px",
                                    borderRadius: "4px",
                                    fontWeight: "600",
                                    whiteSpace: "nowrap",
                                   
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#93c5fd",
                                    letterSpacing: "0.3px",
                                    marginLeft: "8px",
                                    
                                  }}
                                >
                                  {classInfo.section}
                                </span>
                              )}
                          </div>
                          {/* Only show course name if it's different from course code */}
                          {classInfo.courseName &&
                            classInfo.courseName !== classInfo.courseCode &&
                            classInfo.courseName !==
                              (classInfo.courseCode || "") && (
                              <div
                                style={{
                                  fontSize: "13px",
                                  color: "#94a3b8",
                                  fontWeight: "400",
                                  wordBreak: "break-word",
                                  lineHeight: "1.5",
                                  maxWidth: "100%",
                                }}
                              >
                                {classInfo.courseName}
                              </div>
                            )}
                        </div>

                        {/* Right: Time, Room, Instructor - Responsive grid layout */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(160px, 1fr))",
                            gap: "20px",
                            fontSize: "13px",
                            fontWeight: "400",
                            color: "#94a3b8",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#64748b",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                minWidth: "50px",
                              }}
                            >
                              Time:
                            </span>
                            <span
                              style={{
                                lineHeight: "1.5",
                                wordBreak: "break-word",
                                color: "#f1f5f9",
                                fontWeight: "500",
                              }}
                            >
                              {classInfo.timeDisplay ||
                                `${classInfo.startTime} - ${classInfo.endTime}`}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#64748b",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                minWidth: "50px",
                              }}
                            >
                              Room:
                            </span>
                            <span
                              style={{
                                lineHeight: "1.5",
                                wordBreak: "break-word",
                                maxWidth: "100%",
                                color: "#f1f5f9",
                                fontWeight: "500",
                              }}
                            >
                              {classInfo.room || "TBA"}
                            </span>
                          </div>
                          {classInfo.instructor &&
                            classInfo.instructor !== "TBA" && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    color: "#64748b",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                    minWidth: "50px",
                                  }}
                                >
                                  Instructor:
                                </span>
                                <span
                                  style={{
                                    lineHeight: "1.5",
                                    wordBreak: "break-word",
                                    maxWidth: "100%",
                                    color: "#f1f5f9",
                                    fontWeight: "500",
                                  }}
                                >
                                  {classInfo.instructor}
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: "40px",
              textAlign: "center",
              fontSize: "12px",
              color: "#64748b",
              fontWeight: "400",
              paddingTop: "24px",
              borderTop: "1px solid #334155",
              letterSpacing: "0.2px",
            }}
          >
            Generated by Fast Academic Hub
          </div>
        </div>
      </div>

      {/* Export Modal - Allows adding courses before export */}
      {showExportModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="bg-dark-surface border border-dark-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-dark-border">
              <div>
                <h2 className="text-xl font-bold text-content-primary">
                  Export Timetable
                </h2>
                <p className="text-sm text-content-secondary mt-1">
                  Add courses from timetable or export current
                  schedule
                </p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-2 hover:bg-dark-surface-raised rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-content-secondary" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Current Courses Summary */}
              <div className="mb-4 p-4 bg-dark-bg rounded-lg border border-dark-border">
                <p className="text-sm font-medium text-content-primary mb-2">
                  Current Timetable ({courses.length} course
                  {courses.length !== 1 ? "s" : ""})
                </p>
                {courses.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {courses.map((course) => (
                      <span
                        key={course.id}
                        className="px-2 py-1 bg-accent/10 border border-accent/30 rounded text-xs text-accent"
                      >
                        {course.courseCode || course.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Courses Button */}
              <button
                onClick={() => setShowTimetableSelector(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-dark-surface-raised border border-dark-border text-content-primary rounded-lg font-medium hover:bg-dark-surface-hover hover:border-accent/50 transition-all mb-4"
              >
                <Plus className="w-5 h-5" />
                <span>Add Courses from Timetable </span>
              </button>

              {/* Temporary Courses List */}
              {tempCourses.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-content-primary mb-2">
                    Additional Courses for Export ({tempCourses.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tempCourses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-lg px-3 py-1.5 text-sm"
                      >
                        <span className="text-accent font-medium">
                          {course.courseCode || course.name} ({course.section})
                        </span>
                        <button
                          onClick={() => handleRemoveTempCourse(course.id)}
                          className="p-0.5 hover:bg-accent/20 rounded transition-colors"
                        >
                          <X className="w-3 h-3 text-content-tertiary" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Summary */}
              <div className="p-4 bg-dark-bg rounded-lg border border-dark-border">
                <p className="text-sm font-semibold text-content-primary">
                  Total Courses to Export: {totalCoursesForExport}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-dark-border">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2.5 bg-dark-surface-raised border border-dark-border rounded-lg text-content-primary font-medium hover:bg-dark-surface-hover transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalExport}
                disabled={isExporting || totalCoursesForExport === 0}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-accent to-accent-hover text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? "Exporting..." : "Export as Image"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timetable Selector Modal - Unrestricted Mode */}
      {showTimetableSelector && (
        <TimetableSelector
          onCoursesSelected={handleCoursesSelected}
          onClose={() => setShowTimetableSelector(false)}
          showManualOption={false}
          allowUnrestrictedSelection={true}
          allowDuplicates={true}
          allowConflicts={true}
          excludedCourses={tempCourses}
        />
      )}
    </>
  );
}
