import { useState } from "react";
import { Button, Card, Toggle, Divider, Badge } from "@questboard/ui";

interface SettingRow {
  label: string;
  description: string;
  checked: boolean;
  onToggle: (val: boolean) => void;
}

function SettingToggle({ label, description, checked, onToggle }: SettingRow) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 mr-4">
        <div className="text-sm font-medium text-text-primary">{label}</div>
        <div className="text-xs text-text-muted mt-0.5">{description}</div>
      </div>
      <Toggle checked={checked} onToggle={onToggle} />
    </div>
  );
}

export function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [sessionEmails, setSessionEmails] = useState(true);
  const [friendOnline, setFriendOnline] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">
          Configurações
        </h1>
        <p className="text-text-secondary mt-1">Ajuste sua experiência no QuestBoard</p>
      </div>

      {/* Notifications */}
      <Card>
        <h2 className="text-base font-display font-semibold text-text-primary mb-1">
          Notificações
        </h2>
        <p className="text-xs text-text-muted mb-4">
          Controle como e quando receber alertas
        </p>
        <div className="divide-y divide-border-default">
          <SettingToggle
            label="Notificações push"
            description="Receba alertas no navegador"
            checked={notifications}
            onToggle={setNotifications}
          />
          <SettingToggle
            label="E-mails de sessão"
            description="Lembrete por e-mail antes de sessões agendadas"
            checked={sessionEmails}
            onToggle={setSessionEmails}
          />
          <SettingToggle
            label="Amigo online"
            description="Notificar quando um amigo ficar online"
            checked={friendOnline}
            onToggle={setFriendOnline}
          />
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <h2 className="text-base font-display font-semibold text-text-primary mb-1">
          Aparência
        </h2>
        <p className="text-xs text-text-muted mb-4">Personalize a interface</p>
        <div className="divide-y divide-border-default">
          <SettingToggle
            label="Efeitos sonoros"
            description="Sons ao rolar dados e receber notificações"
            checked={soundEffects}
            onToggle={setSoundEffects}
          />
          <SettingToggle
            label="Modo compacto"
            description="Reduz espaçamento para mais conteúdo na tela"
            checked={compactMode}
            onToggle={setCompactMode}
          />
        </div>
      </Card>

      {/* Privacy */}
      <Card>
        <h2 className="text-base font-display font-semibold text-text-primary mb-1">
          Privacidade
        </h2>
        <p className="text-xs text-text-muted mb-4">Gerencie sua visibilidade</p>
        <div className="divide-y divide-border-default">
          <SettingToggle
            label="Mostrar status online"
            description="Seus amigos podem ver quando você está online"
            checked={showOnlineStatus}
            onToggle={setShowOnlineStatus}
          />
        </div>
      </Card>

      {/* Account */}
      <Card>
        <h2 className="text-base font-display font-semibold text-text-primary mb-1">
          Conta
        </h2>
        <p className="text-xs text-text-muted mb-4">Gerenciar dados da conta</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium text-text-primary">E-mail</div>
              <div className="text-xs text-text-muted">aventureiro@email.com</div>
            </div>
            <Button variant="ghost" size="sm">
              Alterar
            </Button>
          </div>
          <Divider />
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium text-text-primary">Senha</div>
              <div className="text-xs text-text-muted">Gerenciada pelo Clerk</div>
            </div>
            <Button variant="ghost" size="sm">
              Alterar
            </Button>
          </div>
          <Divider />
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium text-error">Excluir conta</div>
              <div className="text-xs text-text-muted">
                Ação irreversível — todos os dados serão removidos
              </div>
            </div>
            <Button variant="danger" size="sm">
              Excluir
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
