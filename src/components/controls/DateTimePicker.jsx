import React, { useState, useEffect, useRef } from "react";
import { createInputStyle, createContainerStyle } from "../../utils";
import "../../styles/styles.css";

const formatDateTime = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const DateTimePicker = ({ value, onChange }) => {
  const [dateTimeString, setDateTimeString] = useState(() => formatDateTime(value || new Date()));
  const valueTimeRef = useRef(value instanceof Date ? value.getTime() : null);

  useEffect(() => {
    if (value instanceof Date && !isNaN(value.getTime())) {
      const valueTime = value.getTime();
      if (valueTimeRef.current !== valueTime) {
        valueTimeRef.current = valueTime;
        const formatted = formatDateTime(value);
        setDateTimeString(formatted);
      }
    }
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setDateTimeString(newValue);
    
    if (newValue) {
      const dateTime = new Date(newValue);
      if (!isNaN(dateTime.getTime())) {
        onChange(dateTime);
      }
    }
  };

  const inputStyle = createInputStyle("180px");
  const containerStyle = createContainerStyle({ paddingLeft: "20px" });

  return (
    <div style={containerStyle}>
      <input
        type="datetime-local"
        value={dateTimeString}
        onChange={handleChange}
        style={inputStyle}
      />
    </div>
  );
};

export default DateTimePicker;
