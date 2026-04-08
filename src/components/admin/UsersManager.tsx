"use client";

import { Pencil, Shield, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { UserPurchasesDialog } from "@/components/admin/UserPurchasesDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminUserRecord } from "@/lib/server/admin-users";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function UsersManager({
  initialUsers,
}: {
  initialUsers: AdminUserRecord[];
}) {
  const [users, setUsers] = useState<AdminUserRecord[]>(initialUsers);
  const [isSaving, setIsSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const t = useTranslations("admin.users");

  function openEditDialog(user: AdminUserRecord) {
    setEditingUser(user);
    setName(user.name ?? "");
    setEmail(user.email);
    setRole(user.role);
  }

  async function handleSave() {
    if (!editingUser) return;

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          name,
          email,
          role,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        user?: AdminUserRecord;
      };

      if (!response.ok || !payload.user) {
        throw new Error(payload.error ?? t("errors.update"));
      }

      setUsers((current) =>
        current.map((item) =>
          item.id === payload.user?.id ? payload.user : item,
        ),
      );
      setEditingUser(null);
      toast.success(t("success.updated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.update"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Card className="shadow-xs">
        <CardHeader className="border-b px-3 sm:px-6">
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {t("empty")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-3 sm:pl-6">
                    {t("columns.user")}
                  </TableHead>
                  <TableHead>{t("columns.email")}</TableHead>
                  <TableHead>{t("columns.role")}</TableHead>
                  <TableHead>{t("columns.joined")}</TableHead>
                  <TableHead className="pr-3 text-right sm:pr-6">
                    {t("columns.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="pl-3 sm:pl-6">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex size-8 items-center justify-center rounded-full border bg-muted/30">
                          <UserRound className="size-4" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.name ?? t("unnamed")}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {user.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                      >
                        <Shield className="size-3.5" />
                        {t(`roles.${user.role}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="pr-3 text-right sm:pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t("edit.open", { email: user.email })}
                          onClick={() => openEditDialog(user)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <UserPurchasesDialog
                          userId={user.id}
                          email={user.email}
                          name={user.name}
                          isAdmin={user.role === "admin"}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={editingUser !== null}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("edit.title")}</DialogTitle>
            <DialogDescription>
              {editingUser?.email ?? t("edit.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="user-name">{t("edit.fields.name")}</Label>
              <Input
                id="user-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t("edit.placeholders.name")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-email">{t("edit.fields.email")}</Label>
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("edit.placeholders.email")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="user-role">{t("edit.fields.role")}</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as "admin" | "user")}
              >
                <SelectTrigger id="user-role">
                  <SelectValue placeholder={t("edit.fields.role")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">{t("roles.user")}</SelectItem>
                  <SelectItem value="admin">{t("roles.admin")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              {t("edit.cancel")}
            </Button>
            <Button onClick={() => void handleSave()} disabled={isSaving}>
              {isSaving ? t("edit.saving") : t("edit.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
