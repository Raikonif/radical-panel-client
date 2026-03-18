export type UiLocale = "es" | "en";

export const messages = {
  es: {
    common: {
      open: "Abrir",
      cancel: "Cancelar",
      deleting: "Eliminando...",
      unknownError: "Error desconocido.",
      updatedAt: "Actualizado",
      noTranslation: "Sin ficha",
      translationLabel: "Ficha",
      created: "Creado",
      updated: "Actualizado",
      active: "Activo",
      draft: "Borrador",
      activeSession: "Sesion activa",
      noEmail: "Usuario sin correo",
      signOut: "Salir",
      signingOut: "Cerrando...",
      signOutSuccess: "Sesion cerrada.",
      signOutError: "No se pudo cerrar sesion.",
      create: "Crear",
      edit: "Editar",
      detail: "Detalle",
      delete: "Eliminar",
      availableIn: "en",
      autoTranslationCreated:
        "Se genero la traduccion automatica complementaria.",
      autoTranslationFailed:
        "El contenido se guardo, pero la traduccion automatica no se pudo crear.",
      languageNames: {
        es: "espanol",
        en: "ingles",
      },
    },
    shell: {
      brandTitle: "Espacio editorial",
      navigation: "Navegacion",
      headerDescription:
        "CRUD rapido en espanol e ingles, con menos pasos y mejor contexto.",
      nav: {
        dashboard: {
          label: "Resumen",
          description: "Vista general, conteos y cambios recientes.",
        },
        cases: {
          label: "Casos",
          description: "Casos clinicos, ficha bilingue e imagenes.",
        },
        videos: {
          label: "Videos",
          description: "Catalogo audiovisual y metadata en ES/EN.",
        },
        podcasts: {
          label: "Podcasts",
          description: "Episodios, slugs y estado de publicacion.",
        },
      },
    },
    login: {
      headline: "Operaciones de contenido con menos friccion.",
      description:
        "Un panel enfocado en Supabase para casos, videos y podcasts. La interfaz esta pensada para revisar, editar y publicar con rapidez.",
      highlights: [
        {
          title: "Casos en un solo flujo",
          description:
            "Mantiene diagnostico, complejidad, muestra e imagenes juntos para evitar saltos entre pantallas.",
        },
        {
          title: "Publicacion de medios",
          description:
            "Gestiona videos y podcasts desde el mismo espacio de trabajo, con traducciones en espanol e ingles.",
        },
        {
          title: "Claridad operativa",
          description:
            "Los conteos y cambios recientes dejan claro que se modifico y que falta publicar.",
        },
      ],
      title: "Iniciar sesion",
      body: "Ingresa tu correo y te enviaremos un codigo de verificacion de Supabase Auth para entrar al panel.",
      codeBody:
        "Revisa tu correo, copia el codigo de seis digitos y completalo aqui para entrar al panel.",
      missingConfig:
        "Supabase todavia no esta configurado. Agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` antes de iniciar sesion.",
      email: "Correo",
      code: "Codigo de verificacion",
      emailPlaceholder: "editor@panelradical.app",
      codePlaceholder: "123456",
      submit: "Enviar codigo",
      verifySubmit: "Verificar codigo",
      submitting: "Enviando codigo...",
      verifying: "Verificando...",
      resendCode: "Reenviar codigo",
      changeEmail: "Cambiar correo",
      codeSentTo: "Enviamos un codigo a",
      codeSentSuccess: "Codigo enviado. Revisa tu correo para continuar.",
      loginSuccess: "Sesion iniciada. Redirigiendo al resumen.",
      loginError: "No se pudo iniciar sesion.",
      emailError: "Escribe un correo valido.",
      codeError: "Escribe el codigo de 6 digitos.",
    },
    dashboard: {
      eyebrow: "Vista operativa",
      title: "Mantiene el contenido ordenado y listo para publicar.",
      description:
        "El resumen muestra volumen actual, traducciones activas en ES y EN, y las ultimas ediciones dentro de la biblioteca.",
      liveTitle: "Resumen vivo",
      liveDescription: "Los conteos se refrescan desde Supabase al recargar.",
      stats: {
        cases: {
          label: "Casos",
          detail: "Casos clinicos almacenados en el panel.",
        },
        videos: {
          label: "Videos",
          detail: "Videos con metadata administrable en ES y EN.",
        },
        podcasts: {
          label: "Podcasts",
          detail: "Episodios listos para publicacion.",
        },
        activeTranslations: {
          label: "Activos ES/EN",
          detailSuffix: "imagenes asociadas a los casos.",
        },
      },
      recents: {
        empty: "Todavia no hay registros recientes.",
        cases: {
          title: "Casos recientes",
          description: "Ultimos casos cargados con su ficha base.",
        },
        videos: {
          title: "Videos recientes",
          description: "Ultimos videos con descripcion base y traducciones.",
        },
        podcasts: {
          title: "Podcasts recientes",
          description: "Ultimos episodios con copy y slug listos.",
        },
      },
      loadError: "No se pudo cargar el resumen",
    },
    content: {
      cases: {
        title: "Casos",
        description:
          "Lista centralizada de casos con acciones tipicas de panel: ver, editar, eliminar y crear desde modal.",
        createLabel: "Nuevo caso",
        searchPlaceholder: "Buscar por titulo, diagnostico o complejidad",
        empty:
          "Todavia no hay casos. Crea el primero para iniciar la biblioteca clinica.",
        totalDetail: "Total de registros clinicos.",
        activeDetailPrefix: "Casos publicados en",
        imagesLabel: "Imagenes",
        imagesDetail: "Recursos visuales asociados.",
        loadError: "No se pudieron cargar los casos",
        saveCreated: "Caso creado.",
        saveUpdated: "Caso actualizado.",
        saveError: "No se pudo guardar el caso.",
        deleteSuccess: "Caso eliminado.",
        deleteError: "No se pudo eliminar el caso.",
      },
      videos: {
        title: "Videos",
        description:
          "Lista tipo panel con acciones por fila y CRUD completo dentro de modales.",
        createLabel: "Nuevo video",
        searchPlaceholder: "Buscar por nombre o descripcion",
        empty:
          "Todavia no hay videos. Crea el primero para arrancar el catalogo.",
        totalDetail: "Total de videos cargados.",
        activeDetailPrefix: "Videos publicados en",
        loadError: "No se pudieron cargar los videos",
        saveCreated: "Video creado.",
        saveUpdated: "Video actualizado.",
        saveError: "No se pudo guardar el video.",
        deleteSuccess: "Video eliminado.",
        deleteError: "No se pudo eliminar el video.",
      },
      podcasts: {
        title: "Podcasts",
        description:
          "Lista con acciones por fila y CRUD completo desde modal, como un panel administrativo clasico.",
        createLabel: "Nuevo podcast",
        searchPlaceholder: "Buscar por titulo, slug o cuerpo",
        empty:
          "Todavia no hay podcasts. Crea el primero para iniciar la serie.",
        totalDetail: "Total de episodios cargados.",
        activeDetail: "Episodios activos.",
        loadError: "No se pudieron cargar los podcasts",
        saveCreated: "Podcast creado.",
        saveUpdated: "Podcast actualizado.",
        saveError: "No se pudo guardar el podcast.",
        deleteSuccess: "Podcast eliminado.",
        deleteError: "No se pudo eliminar el podcast.",
      },
      modal: {
        createCase: "Crear caso",
        editCase: "Editar caso",
        viewCase: "Detalle del caso",
        deleteCase: "Eliminar caso",
        createVideo: "Crear video",
        editVideo: "Editar video",
        viewVideo: "Detalle del video",
        deleteVideo: "Eliminar video",
        createPodcast: "Crear podcast",
        editPodcast: "Editar podcast",
        viewPodcast: "Detalle del podcast",
        deletePodcast: "Eliminar podcast",
        deleteCaseDescription: "Confirma la eliminacion del caso.",
        deleteVideoDescription: "Confirma la eliminacion del video.",
        deletePodcastDescription: "Confirma la eliminacion del podcast.",
      },
    },
    theme: {
      light: "Claro",
      dark: "Oscuro",
      system: "Sistema",
    },
    uiLanguage: {
      spanish: "Espanol",
      english: "English",
    },
  },
  en: {
    common: {
      open: "Open",
      cancel: "Cancel",
      deleting: "Deleting...",
      unknownError: "Unknown error.",
      updatedAt: "Updated",
      noTranslation: "No translation",
      translationLabel: "Translation",
      created: "Created",
      updated: "Updated",
      active: "Active",
      draft: "Draft",
      activeSession: "Active session",
      noEmail: "User without email",
      signOut: "Sign out",
      signingOut: "Signing out...",
      signOutSuccess: "Session closed.",
      signOutError: "Could not sign out.",
      create: "Create",
      edit: "Edit",
      detail: "Detail",
      delete: "Delete",
      availableIn: "in",
      autoTranslationCreated:
        "The complementary automatic translation was created.",
      autoTranslationFailed:
        "The content was saved, but the automatic translation could not be created.",
      languageNames: {
        es: "Spanish",
        en: "English",
      },
    },
    shell: {
      brandTitle: "Editorial workspace",
      navigation: "Navigation",
      headerDescription:
        "Fast CRUD in Spanish and English, with fewer steps and better context.",
      nav: {
        dashboard: {
          label: "Overview",
          description: "General view, counters and recent changes.",
        },
        cases: {
          label: "Cases",
          description: "Clinical cases, bilingual record and images.",
        },
        videos: {
          label: "Videos",
          description: "Audiovisual catalog and metadata in ES/EN.",
        },
        podcasts: {
          label: "Podcasts",
          description: "Episodes, slugs and publishing status.",
        },
      },
    },
    login: {
      headline: "Content operations with less friction.",
      description:
        "A Supabase-focused panel for cases, videos and podcasts. The interface is designed to review, edit and publish quickly.",
      highlights: [
        {
          title: "Cases in one flow",
          description:
            "Keeps diagnosis, complexity, specimen and images together to avoid screen jumping.",
        },
        {
          title: "Media publishing",
          description:
            "Manage videos and podcasts from the same workspace, with Spanish and English translations.",
        },
        {
          title: "Operational clarity",
          description:
            "Counts and recent changes make it clear what changed and what is still pending.",
        },
      ],
      title: "Sign in",
      body: "Enter your email and we will send a Supabase Auth verification code so you can access the panel.",
      codeBody:
        "Check your inbox, copy the six-digit code, and enter it here to access the panel.",
      missingConfig:
        "Supabase is not configured yet. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` before signing in.",
      email: "Email",
      code: "Verification code",
      emailPlaceholder: "editor@panelradical.app",
      codePlaceholder: "123456",
      submit: "Send code",
      verifySubmit: "Verify code",
      submitting: "Sending code...",
      verifying: "Verifying...",
      resendCode: "Resend code",
      changeEmail: "Change email",
      codeSentTo: "We sent a code to",
      codeSentSuccess: "Code sent. Check your email to continue.",
      loginSuccess: "Signed in. Redirecting to overview.",
      loginError: "Could not sign in.",
      emailError: "Enter a valid email.",
      codeError: "Enter the 6-digit code.",
    },
    dashboard: {
      eyebrow: "Operational view",
      title: "Keeps content organized and ready to publish.",
      description:
        "The overview shows current volume, active ES/EN translations and the latest edits across the library.",
      liveTitle: "Live overview",
      liveDescription: "Counts refresh from Supabase when the page reloads.",
      stats: {
        cases: {
          label: "Cases",
          detail: "Clinical cases stored in the panel.",
        },
        videos: {
          label: "Videos",
          detail: "Videos with metadata manageable in ES and EN.",
        },
        podcasts: {
          label: "Podcasts",
          detail: "Episodes ready for publishing.",
        },
        activeTranslations: {
          label: "Active ES/EN",
          detailSuffix: "images attached to cases.",
        },
      },
      recents: {
        empty: "There are no recent records yet.",
        cases: {
          title: "Recent cases",
          description: "Latest uploaded cases with their base record.",
        },
        videos: {
          title: "Recent videos",
          description: "Latest videos with base description and translations.",
        },
        podcasts: {
          title: "Recent podcasts",
          description: "Latest episodes with copy and slug ready.",
        },
      },
      loadError: "Could not load the overview",
    },
    content: {
      cases: {
        title: "Cases",
        description:
          "Centralized list of cases with typical panel actions: view, edit, delete and create from a modal.",
        createLabel: "New case",
        searchPlaceholder: "Search by title, diagnosis or complexity",
        empty:
          "There are no cases yet. Create the first one to start the clinical library.",
        totalDetail: "Total clinical records.",
        activeDetailPrefix: "Cases published in",
        imagesLabel: "Images",
        imagesDetail: "Associated visual resources.",
        loadError: "Could not load the cases",
        saveCreated: "Case created.",
        saveUpdated: "Case updated.",
        saveError: "Could not save the case.",
        deleteSuccess: "Case deleted.",
        deleteError: "Could not delete the case.",
      },
      videos: {
        title: "Videos",
        description:
          "Panel-style list with row actions and full CRUD inside modals.",
        createLabel: "New video",
        searchPlaceholder: "Search by name or description",
        empty:
          "There are no videos yet. Create the first one to start the catalog.",
        totalDetail: "Total uploaded videos.",
        activeDetailPrefix: "Videos published in",
        loadError: "Could not load the videos",
        saveCreated: "Video created.",
        saveUpdated: "Video updated.",
        saveError: "Could not save the video.",
        deleteSuccess: "Video deleted.",
        deleteError: "Could not delete the video.",
      },
      podcasts: {
        title: "Podcasts",
        description:
          "List with row actions and full CRUD from a modal, like a classic admin panel.",
        createLabel: "New podcast",
        searchPlaceholder: "Search by title, slug or body",
        empty:
          "There are no podcasts yet. Create the first one to start the series.",
        totalDetail: "Total uploaded episodes.",
        activeDetail: "Active episodes.",
        loadError: "Could not load the podcasts",
        saveCreated: "Podcast created.",
        saveUpdated: "Podcast updated.",
        saveError: "Could not save the podcast.",
        deleteSuccess: "Podcast deleted.",
        deleteError: "Could not delete the podcast.",
      },
      modal: {
        createCase: "Create case",
        editCase: "Edit case",
        viewCase: "Case details",
        deleteCase: "Delete case",
        createVideo: "Create video",
        editVideo: "Edit video",
        viewVideo: "Video details",
        deleteVideo: "Delete video",
        createPodcast: "Create podcast",
        editPodcast: "Edit podcast",
        viewPodcast: "Podcast details",
        deletePodcast: "Delete podcast",
        deleteCaseDescription: "Confirm case deletion.",
        deleteVideoDescription: "Confirm video deletion.",
        deletePodcastDescription: "Confirm podcast deletion.",
      },
    },
    theme: {
      light: "Light",
      dark: "Dark",
      system: "System",
    },
    uiLanguage: {
      spanish: "Spanish",
      english: "English",
    },
  },
} as const;

export type Messages = (typeof messages)[UiLocale];
