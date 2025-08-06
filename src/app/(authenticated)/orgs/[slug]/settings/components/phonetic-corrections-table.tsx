"use client";

import { useState } from "react";

import { Plus, Trash2 } from "lucide-react";
import { generateRandomID } from "@/lib/utils";
import { PhoneticCorrection } from "@convex/schema/workspace";
import { confirm } from "@/components/confirm";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const PhoneticCorrectionsTable = (props: {
  value: PhoneticCorrection[];
  onChange(newValue: PhoneticCorrection[]): void;
}) => {
  const { value, onChange } = props;

  // Track local edits for immediate UI feedback
  const [localEdits, setLocalEdits] = useState<
    Record<string, Partial<PhoneticCorrection>>
  >({});

  // Track if we're adding a new row
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newActualSpelling, setNewActualSpelling] = useState("");
  const [newPhoneticSpelling, setNewPhoneticSpelling] = useState("");

  // Get the display value for a field (local edit or original)
  const getDisplayValue = (
    row: PhoneticCorrection,
    field: keyof PhoneticCorrection
  ): string => {
    const edit = localEdits[row.id];
    if (edit && field in edit) {
      return edit[field] as string;
    }
    return row[field] as string;
  };

  // Handle updating an existing correction
  const handleUpdate = (
    id: string,
    field: "word" | "phonetic",
    newValue: string
  ) => {
    const updated = value.map((item) =>
      item.id === id ? { ...item, [field]: newValue } : item
    );
    onChange(updated);
    // Clear local edit for this field
    setLocalEdits((prev) => {
      const newEdits = { ...prev };
      if (newEdits[id]) {
        delete newEdits[id][field];
        if (Object.keys(newEdits[id]).length === 0) {
          delete newEdits[id];
        }
      }
      return newEdits;
    });
  };

  // Handle deleting a correction
  const handleDelete = async (id: string) => {
    const result = await confirm(
      "Are you sure you want to delete this correction?",
      {
        title: "Delete Phonetic Correction",
        ctaText: "Delete",
        cancelText: "Cancel",
      }
    );

    if (result) {
      const filtered = value.filter((item) => item.id !== id);
      onChange(filtered);
      // Clear any local edits for this item
      setLocalEdits((prev) => {
        const newEdits = { ...prev };
        delete newEdits[id];
        return newEdits;
      });
    }
  };

  // Handle adding a new correction
  const handleAddNew = () => {
    if (!newActualSpelling.trim() || !newPhoneticSpelling.trim()) {
      return;
    }

    const newCorrection: PhoneticCorrection = {
      id: generateRandomID(),
      word: newActualSpelling.trim(),
      phonetic: newPhoneticSpelling.trim(),
    };

    const updated = [...value, newCorrection];
    onChange(updated);

    // Reset form
    setNewActualSpelling("");
    setNewPhoneticSpelling("");
    setIsAddingNew(false);
  };

  // Handle canceling new row
  const handleCancelNew = () => {
    setNewActualSpelling("");
    setNewPhoneticSpelling("");
    setIsAddingNew(false);
  };

  // Check if actual spelling already exists (case-insensitive)
  const isDuplicate = (spelling: string, excludeId?: string): boolean => {
    const normalized = spelling.toLowerCase().trim();
    return value.some(
      (c) => c.word.toLowerCase() === normalized && c.id !== excludeId
    );
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Actual Spelling</TableHead>
            <TableHead className="w-[40%]">Phonetic Spelling</TableHead>
            <TableHead className="w-[20%]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {value.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Input
                  value={getDisplayValue(row, "word")}
                  onChange={(e) => {
                    // Update local state for immediate feedback
                    setLocalEdits((prev) => ({
                      ...prev,
                      [row.id]: {
                        ...prev[row.id],
                        actualSpelling: e.target.value,
                      },
                    }));
                  }}
                  onBlur={(e) => {
                    const newValue = e.target.value.trim();
                    if (!newValue || newValue === row.word) {
                      // Clear local edit if empty or unchanged
                      setLocalEdits((prev) => {
                        const newEdits = { ...prev };
                        if (newEdits[row.id]) {
                          delete newEdits[row.id].word;
                          if (Object.keys(newEdits[row.id]).length === 0) {
                            delete newEdits[row.id];
                          }
                        }
                        return newEdits;
                      });
                      return;
                    }
                    if (isDuplicate(newValue, row.id)) {
                      // Clear local edit on duplicate
                      setLocalEdits((prev) => {
                        const newEdits = { ...prev };
                        if (newEdits[row.id]) {
                          delete newEdits[row.id].word;
                          if (Object.keys(newEdits[row.id]).length === 0) {
                            delete newEdits[row.id];
                          }
                        }
                        return newEdits;
                      });
                      alert("This spelling already exists");
                      return;
                    }
                    handleUpdate(row.id, "word", newValue);
                  }}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={getDisplayValue(row, "phonetic")}
                  onChange={(e) => {
                    // Update local state for immediate feedback
                    setLocalEdits((prev) => ({
                      ...prev,
                      [row.id]: {
                        ...prev[row.id],
                        phonetic: e.target.value,
                      },
                    }));
                  }}
                  onBlur={(e) => {
                    const newValue = e.target.value.trim();
                    if (!newValue || newValue === row.phonetic) {
                      // Clear local edit if empty or unchanged
                      setLocalEdits((prev) => {
                        const newEdits = { ...prev };
                        if (newEdits[row.id]) {
                          delete newEdits[row.id].phonetic;
                          if (Object.keys(newEdits[row.id]).length === 0) {
                            delete newEdits[row.id];
                          }
                        }
                        return newEdits;
                      });
                      return;
                    }
                    handleUpdate(row.id, "phonetic", newValue);
                  }}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(row.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {/* New row */}
          {isAddingNew && (
            <TableRow>
              <TableCell>
                <Input
                  value={newActualSpelling}
                  onChange={(e) => setNewActualSpelling(e.target.value)}
                  placeholder="Enter actual spelling"
                  autoFocus
                />
              </TableCell>
              <TableCell>
                <Input
                  value={newPhoneticSpelling}
                  onChange={(e) => setNewPhoneticSpelling(e.target.value)}
                  placeholder="Enter phonetic spelling"
                />
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddNew}
                    disabled={
                      !newActualSpelling.trim() ||
                      !newPhoneticSpelling.trim() ||
                      isDuplicate(newActualSpelling)
                    }
                  >
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCancelNew}>
                    Cancel
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}

          {/* Add button */}
          {!isAddingNew && (
            <TableRow>
              <TableCell colSpan={3}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex w-full items-center justify-center"
                  onClick={() => setIsAddingNew(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add correction
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
