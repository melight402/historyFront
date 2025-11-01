import React from "react";
import { createButtonHoverHandlers, createContainerStyle } from "../../utils";

const DeleteTools = ({ onDeleteSelected, onDeleteAll }) => {
  const deleteButtonHandlers = createButtonHoverHandlers("danger");
  const containerStyle = createContainerStyle();

  return (
    <div style={containerStyle}>
      <button
        {...deleteButtonHandlers}
        onClick={onDeleteSelected}
        title="Удалить выбранный элемент (элемент должен быть выделен на графике)"
      >
        Удалить выбранный
      </button>
      <button
        {...deleteButtonHandlers}
        onClick={onDeleteAll}
        title="Удалить все нарисованные элементы"
      >
        Удалить всё
      </button>
    </div>
  );
};

export default DeleteTools;

