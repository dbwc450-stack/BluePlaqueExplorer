import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';

type Plaque = {
  open_plaques_id: number;
  title: string;
  inscription: string;
  address: string;
  area: string;
  country: string;
  erected: string;
  colour: string;
  organisations: string;
  main_photo: string;
  lead_subject_name: string;
  lead_subject_born_in: string;
  lead_subject_died_in: string;
  lead_subject_primary_role: string;
  lead_subject_wikipedia: string;
  plus_code: string;
  latitude: number;
  longitude: number;
};

export default function PlaqueDetailScreen() {
  const { id } = useLocalSearchParams();
  const [plaque, setPlaque] = useState<Plaque | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlaque();
  }, [id]);

  async function fetchPlaque() {
    const { data, error } = await supabase
      .from('plaques')
      .select('*')
      .eq('open_plaques_id', id)
      .single();

    if (error) setError(JSON.stringify(error));
    if (data) setPlaque(data);
    setLoading(false);
  }

  const cleanTitle = (title: string) =>
  title
    .replace(/ Blue Plaque/gi, '')
    .replace(/ Red Plaque/gi, '')
    .replace(/ Green Plaque/gi, '')
    .replace(/ Brown Plaque/gi, '')
    .replace(/ Black Plaque/gi, '')
    .replace(/ Grey Plaque/gi, '')
    .replace(/ Gray Plaque/gi, '')
    .replace(/ White Plaque/gi, '')
    .replace(/ Yellow Plaque/gi, '')
    .replace(/ Purple Plaque/gi, '')
    .replace(/ Bronze Plaque/gi, '')
    .replace(/ Plaque/gi, '')
    .trim();


  const cleanOrganisations = (orgs: string) => {
    try {
      return JSON.parse(orgs).join(', ');
    } catch {
      return orgs;
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1a4fa0" />
      </View>
    );
  }

  if (error || !plaque) {
    return (
      <View style={styles.loading}>
        <Text style={styles.error}>Unable to load plaque details</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{
        title: cleanTitle(plaque.title),
        headerBackTitle: 'Map',
        headerStyle: { backgroundColor: '#1a4fa0' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: 'bold' },
      }} />
      <ScrollView style={styles.container}>
        {plaque.main_photo ? (
          <Image
            source={{ uri: plaque.main_photo }}
            style={styles.photo}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noPhoto}>
            <Text style={styles.noPhotoText}>No photo available</Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{cleanTitle(plaque.title)}</Text>

          {plaque.inscription ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Inscription</Text>
              <Text style={styles.inscription}>{plaque.inscription}</Text>
            </View>
          ) : null}

          {plaque.lead_subject_name ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              {plaque.lead_subject_primary_role ? (
                <Text style={styles.detail}>{plaque.lead_subject_primary_role}</Text>
              ) : null}
              {plaque.lead_subject_born_in || plaque.lead_subject_died_in ? (
                <Text style={styles.detail}>
                  {plaque.lead_subject_born_in && `Born: ${plaque.lead_subject_born_in}`}
                  {plaque.lead_subject_born_in && plaque.lead_subject_died_in && '   '}
                  {plaque.lead_subject_died_in && `Died: ${plaque.lead_subject_died_in}`}
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            {plaque.address ? <Text style={styles.detail}>{plaque.address}</Text> : null}
            {plaque.area ? <Text style={styles.detail}>{plaque.area}</Text> : null}
            {plaque.country ? <Text style={styles.detail}>{plaque.country}</Text> : null}
            {plaque.plus_code ? (
              <Text style={styles.plusCode}>Plus Code: {plaque.plus_code}</Text>
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plaque Details</Text>
            {plaque.erected ? (
              <Text style={styles.detail}>Erected: {plaque.erected}</Text>
            ) : null}
            {plaque.colour ? (
              <Text style={styles.detail}>Colour: {plaque.colour}</Text>
            ) : null}
            {plaque.organisations ? (
              <Text style={styles.detail}>Organisation: {cleanOrganisations(plaque.organisations)}</Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: '100%',
    height: 250,
  },
  noPhoto: {
    width: '100%',
    height: 150,
    backgroundColor: '#e8eef7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPhotoText: {
    color: '#888888',
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a4fa0',
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inscription: {
    fontSize: 16,
    color: '#333333',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  detail: {
    fontSize: 15,
    color: '#333333',
    marginBottom: 4,
  },
  plusCode: {
    fontSize: 14,
    color: '#1a4fa0',
    marginTop: 8,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    padding: 16,
  },
});
