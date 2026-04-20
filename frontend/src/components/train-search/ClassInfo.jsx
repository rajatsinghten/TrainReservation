import React from "react";

const getAvailabilityStyle = (availability) => {
  if (!availability) return { text: 'text-surface-500', bg: 'bg-surface-50', dot: 'bg-surface-400' };
  if (availability.includes('AVL')) return { text: 'text-accent-700', bg: 'bg-accent-50', dot: 'bg-accent-500' };
  if (availability.includes('WL')) return { text: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' };
  if (availability.includes('REGRET') || availability.includes('GNWL')) return { text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' };
  return { text: 'text-surface-500', bg: 'bg-surface-50', dot: 'bg-surface-400' };
};

const ClassInfo = ({ train, selectedClass, onClassSelect }) => {
  return (
    <div>
      {train.classesInfo && train.classesInfo.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {train.classesInfo.map((classInfo) => (
            <ClassCard
              key={classInfo.class}
              classInfo={classInfo}
              isSelected={selectedClass === classInfo.class}
              onSelect={() => onClassSelect(classInfo.class)}
            />
          ))}
        </div>
      ) : (
        <LegacyClassDisplay
          train={train}
          selectedClass={selectedClass}
          onClassSelect={onClassSelect}
        />
      )}
    </div>
  );
};

const ClassCard = ({ classInfo, isSelected, onSelect }) => {
  const avStyle = getAvailabilityStyle(classInfo.availability);

  return (
    <button
      onClick={onSelect}
      className={`rounded-lg px-2 py-1.5 min-w-[72px] flex-shrink-0 transition-all duration-150 border text-left ${
        isSelected
          ? "border-primary-500 bg-primary-50 shadow-sm"
          : "border-surface-200 bg-white hover:border-primary-300 hover:bg-surface-50"
      }`}
    >
      {/* Class + fare on one line */}
      <div className="flex items-center justify-between gap-1.5 mb-1">
        <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${
          isSelected ? "bg-primary-600 text-white" : "bg-surface-100 text-surface-700"
        }`}>
          {classInfo.class}
        </span>
        {classInfo.fare && (
          <span className="text-[10px] font-bold text-surface-700">₹{classInfo.fare}</span>
        )}
      </div>

      {/* Availability */}
      <div className={`flex items-center gap-1 px-1 py-0.5 rounded ${avStyle.bg}`}>
        <span className={`w-1 h-1 rounded-full flex-shrink-0 ${avStyle.dot}`} />
        <span className={`text-[9px] font-semibold truncate leading-none ${avStyle.text}`}>
          {classInfo.availability || 'N/A'}
        </span>
      </div>

      {classInfo.prediction && (
        <div className="mt-0.5 text-[9px] text-primary-600 font-semibold">
          {classInfo.predictionPercentage ? `${classInfo.predictionPercentage}%` : classInfo.prediction}
        </div>
      )}
    </button>
  );
};

const LegacyClassDisplay = ({ train, selectedClass, onClassSelect }) => {
  return (
    <div className="flex flex-wrap gap-1">
      {(train.availableClasses || train.class_type || []).map((cls) => (
        <button
          key={cls}
          onClick={() => onClassSelect(cls)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all duration-150 border ${
            selectedClass === cls
              ? "bg-primary-600 text-white border-primary-600 shadow-sm"
              : "bg-white text-surface-600 border-surface-200 hover:border-primary-300 hover:bg-primary-50"
          }`}
        >
          {cls}
        </button>
      ))}
    </div>
  );
};

export default ClassInfo;
