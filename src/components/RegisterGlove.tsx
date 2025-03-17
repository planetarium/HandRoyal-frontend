import React, { useState, useCallback, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { request } from 'graphql-request';
import { useRequiredAccount } from '../context/AccountContext';
import { GRAPHQL_ENDPOINT, isGloveRegisteredDocument, registerGloveAction } from '../queries';
import { executeTransaction, waitForTransaction } from '../utils/transaction';
import { registerGlove } from '../fetches';
import type { RequestDocument } from 'graphql-request';
import { useNavigate } from 'react-router-dom';
import { useTip } from '../context/TipContext';

const RegisterGlove: React.FC = () => {
  const account = useRequiredAccount();
  const navigate = useNavigate();
  const { tip } = useTip();
  const [gloveAddress, setGloveAddress] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGloveAddressValid, setIsGloveAddressValid] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [initialTip, setInitialTip] = useState<number | null>(null);

  const registerGloveMutation = useMutation({
    mutationFn: async () => {
      if (!gloveAddress) {
        throw new Error('Missing required fields');
      }

      // Call the mutation
      const registerGloveResponse = await request(GRAPHQL_ENDPOINT, registerGloveAction, {
        gloveId: gloveAddress,
      });

      if (!registerGloveResponse.actionQuery?.registerGlove) {
        throw new Error('Failed to register glove');
      }

      const plainValue = registerGloveResponse.actionQuery.registerGlove;
      const txId = await executeTransaction(account, plainValue);
      await waitForTransaction(txId);

      return txId;
    },
    onSuccess: async () => {
      try {
        await registerGlove(gloveAddress, file);
        setErrorMessage(null);
        setIsRegistered(true);
        setInitialTip(tip?.index ?? 0);
      } catch (error) {
        console.error('Failed to register glove:', error);
        setErrorMessage('Failed to register glove. Please try again.');
      }
    },
    onError: (error) => {
      console.error('Failed to register glove:', error);
      setErrorMessage('Failed to register glove. Please try again.');
    }
  });

  useEffect(() => {
    if (isRegistered && initialTip !== null && tip?.index === initialTip + 1) {
      navigate(`/glove/${gloveAddress}`);
    }
  }, [isRegistered, initialTip, tip, navigate, gloveAddress]);

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
            readOnly
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            type="text"
            value={isFetching ? 'Generating...' : gloveAddress}
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
          className="mt-1 block w-full bg-blue-500 text-white p-2 rounded cursor-pointer text-center"
          htmlFor="file-upload"
        >
          Choose File
        </label>
        <input
          accept="image/*"
          className="hidden"
          id="file-upload"
          type="file"
          onChange={handleFileChange}
        />
        {filePreview && (
          <div className="mt-4">
            <img alt="File Preview" className="w-full h-auto rounded-md" src={filePreview} />
          </div>
        )}
      </div>
      <button
        className="bg-blue-500 text-white p-2 rounded cursor-pointer"
        disabled={!isGloveAddressValid || isFetching}
        onClick={handleSubmit}
      >
        Register Glove
      </button>
    </div>
  );
};

export default RegisterGlove;