import { useState } from "react";
import {
  Table,
  Card,
  Typography,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Drawer,
  Space,
  Timeline,
  message,
  Tooltip,
  Checkbox,
  Popconfirm,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserAddOutlined,
  EditOutlined,
  HistoryOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  getBackendUtilisateurs,
  modifierUtilisateur,
  creerUtilisateur,
  supprimerUtilisateur,
  getUserLogs,
  type BackendUtilisateur,
  type UserLog,
} from "../../../api/adminUtilisateursApi";
import { formatDate } from "../../../lib/dateUtils";
import { getPublicParkings } from "../../../api/parkings";
import { getParkingsMock } from "../../../api/adminMock";

const { Title, Text } = Typography;

export function UtilisateursList() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<BackendUtilisateur | null>(null);
  const [selectedUserForLogs, setSelectedUserForLogs] = useState<BackendUtilisateur | null>(null);
  const [isLogsDrawerOpen, setIsLogsDrawerOpen] = useState(false);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const queryClient = useQueryClient();

  // 1. Utilisateurs réels
  const {
    data: utilisateurs = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin_utilisateurs_live"],
    queryFn: getBackendUtilisateurs,
  });

   // Charger les parkings réels depuis la base de données
  const { data: parkings = [] } = useQuery({
    queryKey: ["admin_parkings_live"],
    queryFn: async () => {
      try {
        const live = await getPublicParkings();
        if (live && live.length > 0) return live;
        return getParkingsMock();
      } catch {
        return getParkingsMock();
      }
    },
  });

  // Gestion du "Tout cocher" pour le modal d'Édition
  const selectedEditParkingIds: number[] = Form.useWatch("parkingAssigneIds", editForm) || [];
  const isAllEditChecked = parkings.length > 0 && selectedEditParkingIds.length === parkings.length;
  const isEditIndeterminate = selectedEditParkingIds.length > 0 && selectedEditParkingIds.length < parkings.length;

  const handleToggleAllEdit = (e: any) => {
    editForm.setFieldsValue({
      parkingAssigneIds: e.target.checked ? parkings.map((p) => p.id) : [],
    });
  };

  // Gestion du "Tout cocher" pour le modal de Création
  const selectedAddParkingIds: number[] = Form.useWatch("parkingAssigneIds", addForm) || [];
  const isAllAddChecked = parkings.length > 0 && selectedAddParkingIds.length === parkings.length;
  const isAddIndeterminate = selectedAddParkingIds.length > 0 && selectedAddParkingIds.length < parkings.length;

  const handleToggleAllAdd = (e: any) => {
    addForm.setFieldsValue({
      parkingAssigneIds: e.target.checked ? parkings.map((p) => p.id) : [],
    });
  };


  // 2. Logs d'activité
  const { data: userLogs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ["user_logs", selectedUserForLogs?.id],
    queryFn: () => (selectedUserForLogs ? getUserLogs(selectedUserForLogs.id) : Promise.resolve([])),
    enabled: Boolean(selectedUserForLogs && isLogsDrawerOpen),
  });

  // Mutation Création
  const createMutation = useMutation({
    mutationFn: creerUtilisateur,
    onSuccess: () => {
      message.success("Utilisateur créé avec succès !");
      queryClient.invalidateQueries({ queryKey: ["admin_utilisateurs_live"] });
      setIsAddModalOpen(false);
      addForm.resetFields();
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.detail || "Erreur lors de la création.");
    },
  });

  // Mutation Modification
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => modifierUtilisateur(id, data),
    onSuccess: () => {
      message.success("Informations de l'utilisateur mises à jour !");
      queryClient.invalidateQueries({ queryKey: ["admin_utilisateurs_live"] });
      setIsEditModalOpen(false);
      setSelectedUserForEdit(null);
      editForm.resetFields();
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.detail || "Erreur lors de la mise à jour.");
    },
  });

  // Mutation Suppression Définitive
  const deleteMutation = useMutation({
    mutationFn: supprimerUtilisateur,
    onSuccess: () => {
      message.success("Compte utilisateur supprimé définitivement du système.");
      queryClient.invalidateQueries({ queryKey: ["admin_utilisateurs_live"] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.detail || "Erreur lors de la suppression du compte.");
    },
  });

  const handleOpenEdit = (user: BackendUtilisateur) => {
    setSelectedUserForEdit(user);
    editForm.setFieldsValue({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      statut: user.statut,
      parkingAssigneIds: user.parkingAssigneIds || [],
    });
    setIsEditModalOpen(true);
  };

  const handleOpenLogs = (user: BackendUtilisateur) => {
    setSelectedUserForLogs(user);
    setIsLogsDrawerOpen(true);
  };

  const columns = [
    {
      title: "Utilisateur",
      key: "nomComplet",
      render: (_: unknown, r: BackendUtilisateur) => (
        <div>
          <span className="font-bold text-slate-900 block">{r.nom} {r.prenom}</span>
          <span className="text-xs text-slate-500">{r.email}</span>
        </div>
      ),
    },
    {
      title: "Rôle Système",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        const color = role === "ADMIN_SI" ? "purple" : role === "AGENT" ? "blue" : "cyan";
        return <Tag color={color} className="font-semibold">{role}</Tag>;
      },
    },
    {
      title: "Parkings Rattachés",
      key: "parkings",
      render: (_: unknown, r: BackendUtilisateur) => {
        if (!r.parkingAssigneNoms || r.parkingAssigneNoms.length === 0) {
          return <span className="text-slate-400 italic">Tous (Global)</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {r.parkingAssigneNoms.map((nom, idx) => (
              <Tag key={idx} color="blue" className="text-[11px] font-medium m-0">
                {nom}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: "Statut",
      key: "statut",
      render: (_: unknown, r: BackendUtilisateur) => {
        if (r.statut === "ACTIF") {
          return <Tag icon={<CheckCircleOutlined />} color="success">Actif</Tag>;
        }
        if (r.statut === "BLOQUE") {
          return <Tag icon={<StopOutlined />} color="error">Bloqué</Tag>;
        }
        return <Tag icon={<CloseCircleOutlined />} color="default">Désactivé</Tag>;
      },
    },
    {
      title: "Dernière Connexion",
      dataIndex: "dateDerniereConnexion",
      key: "dateDerniereConnexion",
      render: (date?: string) => date ? formatDate(date) : <span className="text-slate-400">Jamais</span>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, r: BackendUtilisateur) => (
        <Space size="small">
          <Tooltip title="Modifier les infos, rôles & parkings">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(r)}
              className="font-medium text-blue-600 border-blue-200 hover:border-blue-500"
            >
              Éditer
            </Button>
          </Tooltip>

          <Tooltip title="Voir l'historique et logs d'activité">
            <Button
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => handleOpenLogs(r)}
              className="font-medium text-slate-700"
            >
              Logs
            </Button>
          </Tooltip>

          <Popconfirm
            title="Supprimer définitivement le compte ?"
            description={
              <div className="max-w-xs">
                Êtes-vous sûr de vouloir supprimer définitivement <b>{r.nom} {r.prenom}</b> ?
                <br />
                <span className="text-red-500 text-xs">Cette action est irréversible.</span>
              </div>
            }
            okText="Oui, Supprimer"
            cancelText="Annuler"
            okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
            onConfirm={() => deleteMutation.mutate(r.id)}
          >
            <Tooltip title="Supprimer définitivement ce compte">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                className="font-medium"
              >
                Supprimer
              </Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      className="rounded-2xl shadow-xs border border-slate-200/80"
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Actualiser
          </Button>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setIsAddModalOpen(true)}
            className="bg-secondary font-bold"
          >
            Nouvel Utilisateur
          </Button>
        </Space>
      }
    >
      <div className="mb-4">
        <Title level={4} style={{ margin: 0 }}>Gestion des Utilisateurs du Système</Title>
        <Text type="secondary" className="text-xs">
          Comptes réels synchronisés avec la base de données. Vous pouvez cocher plusieurs parkings par agent, modifier leurs accès et supprimer des comptes.
        </Text>
      </div>

      <Table
        columns={columns}
        dataSource={utilisateurs}
        loading={isLoading}
        rowKey="id"
        scroll={{ x: "max-content", y: 550 }}
        pagination={false}
      />

      {/* MODAL CRÉATION */}
      <Modal
        title="Créer un Utilisateur"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={() => addForm.submit()}
        confirmLoading={createMutation.isPending}
        okText="Enregistrer"
        cancelText="Annuler"
        width={560}
      >
        <Form form={addForm} layout="vertical" onFinish={(v) => createMutation.mutate(v)}>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="nom" label="Nom" rules={[{ required: true }]}>
              <Input placeholder="Ex: Bennani" />
            </Form.Item>
            <Form.Item name="prenom" label="Prénom" rules={[{ required: true }]}>
              <Input placeholder="Ex: Youssef" />
            </Form.Item>
          </div>

          <Form.Item name="email" label="Email Professionnel" rules={[{ required: true, type: "email" }]}>
            <Input placeholder="utilisateur@rrm.ma" />
          </Form.Item>

          <Form.Item name="motDePasse" label="Mot de passe initial" rules={[{ required: true }]}>
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          <Form.Item name="role" label="Rôle Système" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "AGENT", label: "Agent de Saisie (Guichet)" },
                { value: "SUPERVISEUR", label: "Superviseur" },
                { value: "RESPONSABLE", label: "Responsable Direction" },
                { value: "COMPTABLE", label: "Comptable" },
                { value: "RESP_REPORTING", label: "Responsable Reporting" },
                { value: "ADMIN_SI", label: "Administrateur SI (IT)" },
              ]}
            />
          </Form.Item>

                    <div>
            <div className="flex justify-between items-center mb-1.5 px-0.5">
              <span className="text-sm font-semibold text-slate-800">
                Parkings Rattachés (Cases à cocher) :
              </span>
              <Checkbox
                indeterminate={isAddIndeterminate}
                checked={isAllAddChecked}
                onChange={handleToggleAllAdd}
                className="font-bold text-xs text-blue-600 select-none"
              >
                Tout cocher ({parkings.length} parkings)
              </Checkbox>
            </div>
            <Form.Item
              name="parkingAssigneIds"
              help="Cochez un ou plusieurs parkings pour cet agent. Si aucun n'est coché, l'accès est global."
            >
              <div className="max-h-52 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <Checkbox.Group
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                  options={parkings.map((p) => ({ label: p.nom, value: p.id }))}
                />
              </div>
            </Form.Item>
          </div>

        </Form>
      </Modal>

      {/* MODAL ÉDITION */}
      <Modal
        title={`Modifier l'Utilisateur : ${selectedUserForEdit?.nom || ""} ${selectedUserForEdit?.prenom || ""}`}
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedUserForEdit(null);
        }}
        onOk={() => editForm.submit()}
        confirmLoading={updateMutation.isPending}
        okText="Appliquer les modifications"
        cancelText="Annuler"
        width={560}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={(values) => {
            if (selectedUserForEdit) {
              updateMutation.mutate({ id: selectedUserForEdit.id, data: values });
            }
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="nom" label="Nom" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="prenom" label="Prénom" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </div>

          <Form.Item name="email" label="Email Professionnel" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="role" label="Rôle Système" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: "AGENT", label: "Agent de Saisie" },
                  { value: "SUPERVISEUR", label: "Superviseur" },
                  { value: "RESPONSABLE", label: "Responsable Direction" },
                  { value: "COMPTABLE", label: "Comptable" },
                  { value: "RESP_REPORTING", label: "Responsable Reporting" },
                  { value: "ADMIN_SI", label: "Administrateur SI" },
                ]}
              />
            </Form.Item>
            <Form.Item name="statut" label="Statut du Compte" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: "ACTIF", label: "Actif" },
                  { value: "DESACTIVE", label: "Désactivé" },
                  { value: "BLOQUE", label: "Bloqué" },
                ]}
              />
            </Form.Item>
          </div>

                    <div>
            <div className="flex justify-between items-center mb-1.5 px-0.5">
              <span className="text-sm font-semibold text-slate-800">
                Parkings Rattachés (Cases à cocher) :
              </span>
              <Checkbox
                indeterminate={isEditIndeterminate}
                checked={isAllEditChecked}
                onChange={handleToggleAllEdit}
                className="font-bold text-xs text-blue-600 select-none"
              >
                Tout cocher ({parkings.length} parkings)
              </Checkbox>
            </div>
            <Form.Item
              name="parkingAssigneIds"
              help="Cochez un ou plusieurs parkings. Si aucun n'est coché, l'accès est global."
            >
              <div className="max-h-52 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <Checkbox.Group
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                  options={parkings.map((p) => ({ label: p.nom, value: p.id }))}
                />
              </div>
            </Form.Item>
          </div>


          <Form.Item
            name="motDePasse"
            label="Nouveau mot de passe"
            help="Laissez vide pour conserver le mot de passe actuel"
          >
            <Input.Password placeholder="Nouveau mot de passe (optionnel)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* DRAWER LOGS */}
      <Drawer
        title={
          <div>
            <div className="font-bold text-slate-900">
              Journal d'activité & Connexions
            </div>
            <div className="text-xs text-slate-500 font-normal">
              {selectedUserForLogs?.email} ({selectedUserForLogs?.role})
            </div>
          </div>
        }
        width={500}
        open={isLogsDrawerOpen}
        onClose={() => {
          setIsLogsDrawerOpen(false);
          setSelectedUserForLogs(null);
        }}
      >
        {isLoadingLogs ? (
          <p className="text-slate-500 text-center py-8">Chargement des logs...</p>
        ) : userLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <HistoryOutlined style={{ fontSize: 32 }} />
            <p className="mt-2 text-sm">Aucun log enregistré pour cet utilisateur.</p>
          </div>
        ) : (
          <Timeline
            items={userLogs.map((log: UserLog) => ({
              color:
                log.typeAction === "AUTHENTIFICATION_REUSSIE"
                  ? "green"
                  : log.typeAction === "MODIFICATION"
                  ? "blue"
                  : log.typeAction === "CREATION"
                  ? "purple"
                  : "gray",
              children: (
                <div className="mb-2">
                  <div className="flex justify-between items-center gap-2">
                    <Tag
                      color={
                        log.typeAction === "AUTHENTIFICATION_REUSSIE"
                          ? "success"
                          : log.typeAction === "MODIFICATION"
                          ? "processing"
                          : "default"
                      }
                      className="font-bold text-[11px]"
                    >
                      {log.typeAction}
                    </Tag>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(log.dateEvenement)}
                    </span>
                  </div>
                  <p className="font-semibold text-xs text-slate-800 mt-1 mb-0.5">
                    {log.message}
                  </p>
                  {log.detailsTechniques && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 font-mono break-all m-0 mt-1">
                      {log.detailsTechniques}
                    </p>
                  )}
                  {log.adresseIp && (
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      IP: {log.adresseIp}
                    </span>
                  )}
                </div>
              ),
            }))}
          />
        )}
      </Drawer>
    </Card>
  );
}
