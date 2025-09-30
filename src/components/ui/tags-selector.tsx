"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/utils";

interface TagsSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  availableTags?: string[];
}

export default function TagsSelector({
  selectedTags,
  onChange,
  placeholder = "Select tags",
  label,
  required = false,
  className = "",
  availableTags = [
    "Premium",
    "Advanced",
    "Basic",
    "Rechargeable",
    "Bluetooth",
    "Wireless",
    "AI-powered",
    "Machine Learning",
    "Waterproof",
    "Noise Cancelling",
    "Directional",
    "Telecoil",
    "Remote Control",
    "App Compatible",
    "Tinnitus Relief",
    "Speech Enhancement",
    "Wind Noise Reduction",
    "Feedback Cancellation",
    "Automatic Program",
    "Manual Program",
    "Behind-the-Ear",
    "In-the-Ear",
    "Receiver-in-Canal",
    "Completely-in-Canal",
    "Invisible-in-Canal",
    "Open Fit",
    "Closed Fit",
    "Custom Fit",
    "Disposable Battery",
    "Size 10",
    "Size 312",
    "Size 13",
    "Size 675",
    "Lithium Ion",
    "Long Lasting",
    "Quick Charge",
    "Travel Case",
    "Cleaning Kit",
    "Maintenance",
    "Universal",
    "Streamer",
    "TV Adapter",
    "Phone Streamer",
    "Remote Microphone",
    "Hands-free",
    "Low Latency",
    "High Capacity",
    "Portable",
    "Compact",
    "Ease of Use"
  ],
  
}: TagsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Filter tags based on search term
  const filteredTags = availableTags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label
          className="block text-xs font-medium text-[#101828] mb-2"
          style={{ fontFamily: "Segoe UI" }}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-left flex items-center justify-between cursor-pointer min-h-[40px]",
            selectedTags.length > 0 ? "bg-white" : "bg-gray-100"
          )}
          style={{
            fontFamily: "Segoe UI",
            color: selectedTags.length > 0 ? "#374151" : "#9CA3AF",
          }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {selectedTags.length > 0 ? (
              <div className="flex items-center gap-1 flex-wrap">
                {selectedTags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                    style={{ fontFamily: "Segoe UI" }}
                  >
                    {tag}
                  </span>
                ))}
                {selectedTags.length > 2 && (
                  <span className="text-xs text-gray-500" style={{ fontFamily: "Segoe UI" }}>
                    +{selectedTags.length - 2} more
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm">{placeholder}</span>
            )}
          </div>
          <svg
            className={cn(
              "w-4 h-4 text-gray-500 ml-2 flex-shrink-0 transition-transform",
              isOpen && "rotate-180"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div
            ref={popoverRef}
            className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-[#101828]" style={{ fontFamily: "Segoe UI" }}>
                Select Item Tags
              </h3>
              <p className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: "Segoe UI" }}>
                {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
              </p>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                style={{ fontFamily: "Segoe UI" }}
              />
            </div>

            {/* Tags List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredTags.length > 0 ? (
                <div className="p-2">
                  {filteredTags.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                        className="w-4 h-4 text-[#3B82F6] border-gray-300 rounded focus:ring-[#3B82F6] focus:ring-2"
                      />
                      <span
                        className="text-sm text-[#101828] flex-1"
                        style={{ fontFamily: "Segoe UI" }}
                      >
                        {tag}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm text-[#4A5565]" style={{ fontFamily: "Segoe UI" }}>
                    No tags found
                  </p>
                </div>
              )}
            </div>

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
              <div className="p-3 !border-t border-gray-200 bg-gray-50">
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <div
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      <span style={{ fontFamily: "Segoe UI" }}>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                        aria-label={`Remove ${tag} tag`}
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
