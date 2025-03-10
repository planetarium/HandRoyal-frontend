import React, { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { useAccount } from '../context/AccountContext';
import { GRAPHQL_ENDPOINT, registerGloveDocument, isGloveRegisteredDocument, GLOVE_SUBSCRIPTION } from '../queries';
import { RequestDocument } from 'graphql-request';
import subscriptionClient from '../subscriptionClient';
import { registerGlove } from '../fetches';
const GLOVE_API_URL = import.meta.env.VITE_GLOVE_API_URL;

const RegisterGlove: React.FC = () => {
  const { privateKey } = useAccount();
  const [gloveAddress, setGloveAddress] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGloveAddressValid, setIsGloveAddressValid] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const registerGloveMutation = useMutation({
    mutationFn: async () => {
      if (!privateKey || !gloveAddress) {
        throw new Error('Missing required fields');
      }

      // Convert privateKey to hex
      const privateKeyBytes = privateKey.toBytes();
      const privateKeyHex = Array.from(privateKeyBytes).map(b => b.toString(16).padStart(2, '0')).join('');

      // Call the mutation
      const response = await request(GRAPHQL_ENDPOINT, registerGloveDocument, {
        privateKey: privateKeyHex,
        gloveId: gloveAddress,
      });

      const unsubscribe = subscriptionClient.subscribe(
        {
          query: GLOVE_SUBSCRIPTION,
          variables: { gloveId: gloveAddress },
        },
        {
          next: (result: any) => {
            if (result.data.onGloveRegistered.id.toLowerCase() === gloveAddress.toLowerCase()) {
              registerGlove(gloveAddress, file);
              unsubscribe();
            }
          },
          error: (err: any) => {
            console.error('Subscription error:', err);
          },
          complete: () => {
            console.log('Subscription completed');
          },
        }
      );

      return response.registerGlove;
    },
    onSuccess: () => {
      setErrorMessage(null);
      alert('Glove registered successfully!');
    },
    onError: (error) => {
      console.error('Failed to register glove:', error);
      setErrorMessage('Failed to register glove. Please try again.');
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      const fileURL = URL.createObjectURL(selectedFile);
      setFilePreview(fileURL);
    }
  };

  const generateRandomAddress = () => {
    let address = '';
    for (let i = 0; i < 40; i++) {
      address += Math.floor(Math.random() * 16).toString(16);
    }
    return address;
  };

  const validateGloveAddress = useCallback(async () => {
    setIsGloveAddressValid(false);
    setIsFetching(true);
    const newGloveAddress = generateRandomAddress();
    setGloveAddress(newGloveAddress);

    try {
      type QueryResult = { isGloveRegistered: boolean };
      const data: QueryResult = await request<QueryResult>(GRAPHQL_ENDPOINT, isGloveRegisteredDocument as RequestDocument, { gloveId: newGloveAddress });
      if (!data.isGloveRegistered) {
        setIsGloveAddressValid(true);
      } else {
        setTimeout(() => {
          validateGloveAddress();
        }, 1000);
      }
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    validateGloveAddress();
  }, [validateGloveAddress]);

  const handleSubmit = () => {
    if (!isGloveAddressValid) {
      setErrorMessage('Please provide a valid glove address and select a file.');
      return;
    }
    registerGloveMutation.mutate();
  };

  return (
    <div className="register-glove p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Register Glove</h1>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <div className="form-group mb-4">
        <label className="block text-sm font-medium text-gray-700">Glove Address</label>
        <div className="flex items-center space-x-2">
          <input
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            type="text"
            value={isFetching ? 'Generating...' : gloveAddress}
            readOnly
          />
          <button
            aria-label="Refresh Glove Address"
            className="text-blue-500 text-2xl cursor-pointer"
            disabled={isFetching}
            onClick={validateGloveAddress}
          >
            🔄
          </button>
        </div>
      </div>
      <div className="form-group mb-4">
        <label className="block text-sm font-medium text-gray-700">Upload Image</label>
        <label
          htmlFor="file-upload"
          className="mt-1 block w-full bg-blue-500 text-white p-2 rounded cursor-pointer text-center"
        >
          Choose File
        </label>
        <input
          id="file-upload"
          className="hidden"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        {filePreview && (
          <div className="mt-4">
            <img src={filePreview} alt="File Preview" className="w-full h-auto rounded-md" />
          </div>
        )}
      </div>
      <button
        className="bg-blue-500 text-white p-2 rounded cursor-pointer"
        onClick={handleSubmit}
        disabled={!isGloveAddressValid || isFetching}
      >
        Register Glove
      </button>
    </div>
  );
};

export default RegisterGlove;