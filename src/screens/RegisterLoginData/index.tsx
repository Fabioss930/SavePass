import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useForm } from "react-hook-form";
import { RFValue } from "react-native-responsive-fontsize";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";

import { Header } from "../../components/Header";
import { Input } from "../../components/Form/Input";
import { Button } from "../../components/Form/Button";

import { Container, Form } from "./styles";
import { StackNavigationProp } from "@react-navigation/stack";

interface FormData {
  service_name: string;
  email: string;
  password: string;
}

const schema = Yup.object().shape({
  service_name: Yup.string().required("Nome do serviço é obrigatório!"),
  email: Yup.string()
    .email("Não é um email válido")
    .required("Email é obrigatório!"),
  password: Yup.string().required("Senha é obrigatória!"),
});

type RootStackParamList = {
  Home: undefined;
  RegisterLoginData: undefined;
};

type NavigationProps = StackNavigationProp<
  RootStackParamList,
  "RegisterLoginData"
>;

export function RegisterLoginData() {
  const { navigate } = useNavigation<NavigationProps>();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  async function handleRegister(formData: FormData) {
    const newLoginData = {
      id: String(uuid.v4()),
      service_name: formData.service_name,
      email: formData.email,
      password: formData.password,
    };

    const dataKey = "@savepass:logins";

    // Save data on AsyncStorage and navigate to 'Home' screen
    try {
      const data = await AsyncStorage.getItem(dataKey);
      const currentData = data ? JSON.parse(data) : [];
      const newData = [...currentData, newLoginData];
      await AsyncStorage.setItem(dataKey, JSON.stringify(newData));

      Alert.alert("Atenção", "Senha salva com sucesso.");
      navigate("Home");
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Atenção!",
        "Não foi possível salvar a senha, favor tente novamente"
      );
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      enabled
    >
      <Header />
      <Container>
        <Form>
          <Input
            testID="service-name-input"
            title="Nome do serviço"
            name="service_name"
            control={control}
            autoCapitalize="sentences"
            autoCorrect
            error={errors.service_name && errors.service_name.message}
          />
          <Input
            testID="email-input"
            title="E-mail ou usuário"
            name="email"
            control={control}
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email && errors.email.message}
          />
          <Input
            testID="password-input"
            title="Senha"
            name="password"
            control={control}
            secureTextEntry
            error={errors.password && errors.password.message}
          />

          <Button
            style={{
              marginTop: RFValue(8),
            }}
            title="Salvar"
            onPress={handleSubmit(handleRegister)}
          />
        </Form>
      </Container>
    </KeyboardAvoidingView>
  );
}
