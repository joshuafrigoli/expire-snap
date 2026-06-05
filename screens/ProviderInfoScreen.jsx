import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme';

const PROVIDER_CONTENT = {
  openrouter: {
    en: {
      title: 'How to set up OpenRouter',
      intro:
        'OpenRouter gives you access to 24+ free AI models — no credit card needed. For premium models, you only pay for what you use (a receipt scan costs less than $0.01).',
      steps: [
        {
          heading: 'Create a free account',
          body: 'Go to openrouter.ai and sign up. No credit card required.',
          url: 'https://openrouter.ai',
          urlLabel: 'Open openrouter.ai',
        },
        {
          heading: 'Go to Settings → Keys',
          body: 'After logging in, open openrouter.ai/settings/keys and click "Create key". Give it any name — e.g. "ExpireSnap".',
          url: 'https://openrouter.ai/settings/keys',
          urlLabel: 'Open API Keys page',
        },
        {
          heading: 'Copy your key',
          body: 'Your key starts with "sk-or-v1-…". Copy the whole thing — it\'s only shown once.',
        },
        {
          heading: 'Paste it in Settings',
          body: 'Go back to Settings and paste the key in the "API Key" field.',
        },
        {
          heading: 'Optional: add credits for premium models',
          body: 'Free models work great for most receipts. If you want faster or more accurate models, add a few dollars under Credits. $5 lasts months.',
        },
      ],
      tip: 'Free models are available right away — no credits needed. The app automatically picks a capable free model for receipt scanning.',
    },
    it: {
      title: 'Come configurare OpenRouter',
      intro:
        'OpenRouter ti dà accesso a 24+ modelli AI gratuiti — nessuna carta di credito richiesta. Per i modelli premium paghi solo ciò che usi (scansionare uno scontrino costa meno di $0,01).',
      steps: [
        {
          heading: 'Crea un account gratuito',
          body: 'Vai su openrouter.ai e registrati. Nessuna carta di credito richiesta.',
          url: 'https://openrouter.ai',
          urlLabel: 'Apri openrouter.ai',
        },
        {
          heading: 'Vai su Settings → Keys',
          body: 'Una volta connesso, apri openrouter.ai/settings/keys e clicca "Create key". Dagli un nome qualsiasi — es. "ExpireSnap".',
          url: 'https://openrouter.ai/settings/keys',
          urlLabel: 'Apri pagina chiavi API',
        },
        {
          heading: 'Copia la chiave',
          body: 'La chiave inizia con "sk-or-v1-…". Copiala per intero — viene mostrata una sola volta.',
        },
        {
          heading: 'Incollala nelle Impostazioni',
          body: 'Torna nelle Impostazioni e incolla la chiave nel campo "Chiave API".',
        },
        {
          heading: 'Opzionale: aggiungi crediti per modelli premium',
          body: 'I modelli gratuiti funzionano bene per la maggior parte degli scontrini. Per modelli più veloci o precisi, aggiungi qualche dollaro sotto Credits. $5 durano mesi.',
        },
      ],
      tip: 'I modelli gratuiti sono disponibili subito — nessun credito necessario. L\'app sceglie automaticamente un buon modello gratuito per la scansione.',
    },
  },
};

const FALLBACK = {
  en: { title: 'Provider Info', intro: 'Setup guide coming soon.', steps: [], tip: null },
  it: { title: 'Info Provider', intro: 'Guida in arrivo.', steps: [], tip: null },
};

export default function ProviderInfoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { i18n } = useTranslation();
  const colors = useTheme();
  const styles = makeStyles(colors);

  const provider = route.params?.provider ?? 'openrouter';
  const lang = i18n.language?.startsWith('it') ? 'it' : 'en';
  const content = PROVIDER_CONTENT[provider]?.[lang] ?? FALLBACK[lang];

  return (
    <SafeAreaView style={styles.root} testID="screen-provider-info">
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{content.title}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>{content.intro}</Text>

        {content.steps.map((step, i) => (
          <View key={i} style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{i + 1}</Text>
            </View>
            <View style={styles.stepBody}>
              <Text style={styles.stepHeading}>{step.heading}</Text>
              <Text style={styles.stepText}>{step.body}</Text>
              {step.url && (
                <Pressable
                  style={styles.linkBtn}
                  onPress={() => Linking.openURL(step.url)}
                >
                  <Ionicons name="open-outline" size={14} color={colors.primary} />
                  <Text style={styles.linkBtnText}>{step.urlLabel}</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))}

        {content.tip && (
          <View style={styles.tip}>
            <Ionicons name="bulb-outline" size={18} color={colors.tipText} />
            <Text style={styles.tipText}>{content.tip}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 9999,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.primary,
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      gap: 16,
    },
    intro: {
      fontSize: 15,
      color: colors.textIntro,
      lineHeight: 22,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 14,
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    step: {
      flexDirection: 'row',
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      padding: 14,
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    stepNumber: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginTop: 1,
    },
    stepNumberText: {
      color: colors.primaryFg,
      fontWeight: '700',
      fontSize: 13,
    },
    stepBody: {
      flex: 1,
      gap: 4,
    },
    stepHeading: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    stepText: {
      fontSize: 14,
      color: colors.textBody,
      lineHeight: 20,
    },
    linkBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 6,
      alignSelf: 'flex-start',
      backgroundColor: colors.bg,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    linkBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
    },
    tip: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'flex-start',
      backgroundColor: colors.tipBg,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.tipBorder,
      padding: 14,
    },
    tipText: {
      flex: 1,
      fontSize: 13,
      color: colors.tipText,
      lineHeight: 19,
    },
  });
}
