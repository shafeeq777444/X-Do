"use client";
import React, { useState } from "react";
import DesktopKanban from "@/components/Desktop/DesktopKanban";
import MobileKanban from "@/components/Mobile/MobileKanban";

const KanbanBoard = () => {
    return (
        <div className=" bg-teal-50 ">
            {/* Mobile View - Dropdowns */}
            <MobileKanban />
            {/* Desktop View - Kanban Board */}
            <DesktopKanban />
        </div>
    );
};

export default KanbanBoard;
