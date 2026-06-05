import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const PROVIDER_CONTENT = {
  openrouter: {
    en: {
      title: 'How to set up OpenRouter',
      intro:
        'OpenRouter gives you access to many AI models with one account. You only pay for what you use — scanning a receipt costs less than $0.01.',
      steps: [
        {
          heading: 'Create a free account',
          body: 'Go to openrouter.ai and sign up. No credit card required to start.',
          url: 'https://openrouter.ai',
          urlLabel: 'Open openrouter.ai',
        },
        {
          heading: 'Add a small credit',
          body: 'Once logged in, click "Credits" and add a few dollars. $5 will last months of normal use.',
        },
        {
          heading: 'Create an API key',
          body: 'Click "Keys" in the left menu, then "Create Key". Give it any name — e.g. "ExpireSnap".',
        },
        {
          heading: 'Copy your key',
          body: 'Your key starts with "sk-or-v1-…". Copy the whole thing.',
        },
        {
          heading: 'Paste it in Settings',
          body: 'Go back to Settings and paste the key in the "API Key" field.',
        },
      ],
      tip: 'Recommended model: google/gemini-flash-1.5 (fast and cheap). You can set this in openrouter.ai under your account preferences, or the app will pick a good default.',
    },
    it: {
      title: 'Come configurare OpenRouter',
      intro:
        'OpenRouter ti dà accesso a molti modelli AI con un solo account. Paghi solo ciò che usi — scansionare uno scontrino costa meno di $0,01.',
      steps: [
        {
          heading: 'Crea un account gratuito',
          body: 'Vai su openrouter.ai e registrati. Non serve la carta di credito per iniziare.',
          url: 'https://openrouter.ai',
          urlLabel: 'Apri openrouter.ai',
        },
        {
          heading: 'Aggiungi un piccolo credito',
          body: 'Una volta connesso, clicca su "Credits" e aggiungi qualche dollaro. $5 durano mesi.',
        },
        {
          heading: 'Crea una chiave API',
          body: 'Clicca su "Keys" nel menu a sinistra, poi "Create Key". Dagli un nome qualsiasi — es. "ExpireSnap".',
        },
        {
          heading: 'Copia la chiave',
          body: 'La chiave inizia con "sk-or-v1-…". Copiala per intero.',
        },
        {
          heading: 'Incollala nelle Impostazioni',
          body: 'Torna nelle Impostazioni e incolla la chiave nel campo "Chiave API".',
        },
      ],
      tip: 'Modello consigliato: google/gemini-flash-1.5 (veloce ed economico).',
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

  const provider = route.params?.provider ?? 'openrouter';
  const lang = i18n.language?.startsWith('it') ? 'it' : 'en';
  const content = PROVIDER_CONTENT[provider]?.[lang] ?? FALLBACK[lang];

  return (
    <SafeAreaView style={styles.root} testID="screen-provider-info">
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#005bc4" />
        </TouchableOpacity>
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
                <TouchableOpacity
                  style={styles.linkBtn}
                  onPress={() => Linking.openURL(step.url)}
                >
                  <Ionicons name="open-outline" size={14} color="#005bc4" />
                  <Text style={styles.linkBtnText}>{step.urlLabel}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {content.tip && (
          <View style={styles.tip}>
            <Ionicons name="bulb-outline" size={18} color="#92400e" />
            <Text style={styles.tipText}>{content.tip}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#eff6ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#005bc4',
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
    color: '#334155',
    lineHeight: 22,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#001a3d',
    padding: 14,
    shadowColor: '#001a3d',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#001a3d',
    padding: 14,
    shadowColor: '#001a3d',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#005bc4',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumberText: {
    color: '#fff',
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
    color: '#001a3d',
  },
  stepText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#005bc4',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  linkBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#005bc4',
  },
  tip: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#92400e',
    padding: 14,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    lineHeight: 19,
  },
});
