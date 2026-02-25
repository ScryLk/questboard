import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, TextInput, Avatar, Divider } from "@questboard/ui";

export function ProfileEditPage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("Aventureiro");
  const [username, setUsername] = useState("aventureiro42");
  const [bio, setBio] = useState(
    "Mestre de D&D há 5 anos. Amo Tormenta20 e Call of Cthulhu."
  );
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    // TODO: PATCH /users/me
    setTimeout(() => {
      setSaving(false);
      navigate("/profile");
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">
          Editar Perfil
        </h1>
        <p className="text-text-secondary mt-1">Personalize sua identidade no QuestBoard</p>
      </div>

      {/* Avatar section */}
      <Card>
        <div className="flex items-center gap-4">
          <Avatar size="xl" fallback="A" />
          <div>
            <Button variant="outline" size="sm">
              Alterar foto
            </Button>
            <p className="text-xs text-text-muted mt-1">JPG, PNG. Max 2MB.</p>
          </div>
        </div>
      </Card>

      {/* Banner */}
      <Card>
        <h3 className="text-sm font-medium text-text-primary mb-3">Banner</h3>
        <div className="h-24 bg-elevated rounded-lg border border-dashed border-border-default flex items-center justify-center">
          <Button variant="ghost" size="sm">
            Carregar banner
          </Button>
        </div>
      </Card>

      {/* Form */}
      <Card>
        <div className="space-y-4">
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            label="Nome de exibição"
            placeholder="Seu nome de aventureiro"
            maxLength={40}
          />
          <TextInput
            value={username}
            onChangeText={setUsername}
            label="Username"
            placeholder="seu_username"
            maxLength={30}
          />
          <TextInput
            value={bio}
            onChangeText={setBio}
            label="Bio"
            placeholder="Conte um pouco sobre você..."
            multiline
            rows={3}
            maxLength={200}
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onPress={() => navigate("/profile")}>
          Cancelar
        </Button>
        <Button variant="primary" disabled={saving} onPress={handleSave}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
