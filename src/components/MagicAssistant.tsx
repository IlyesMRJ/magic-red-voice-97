import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, Settings, Smartphone, MessageSquare, Phone, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceCommand {
  command: string;
  action: string;
  timestamp: Date;
}

const MagicAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [recognition, setRecognition] = useState<any>(null);
  const [synthesis, setSynthesis] = useState<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        
        if (event.results[current].isFinal) {
          setTranscript(transcript);
          handleVoiceCommand(transcript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (isActivated) {
          // Restart listening if still activated
          setTimeout(() => recognition.start(), 1000);
        }
      };
      
      setRecognition(recognition);
    }

    // Initialize Speech Synthesis
    if ('speechSynthesis' in window) {
      setSynthesis(window.speechSynthesis);
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isActivated]);

  const speak = (text: string) => {
    if (synthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      synthesis.speak(utterance);
    }
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Check for activation word
    if (lowerCommand.includes('magic')) {
      if (!isActivated) {
        setIsActivated(true);
        speak("Oui, j'écoute. Que puis-je faire pour vous ?");
        toast({
          title: "Magic Assistant Activé",
          description: "Dites votre commande maintenant",
        });
      }
      return;
    }

    if (!isActivated) return;

    // Process commands
    let action = '';
    
    if (lowerCommand.includes('ouvrir') || lowerCommand.includes('lancer')) {
      action = 'Ouverture d\'application';
      speak("J'ouvre l'application demandée");
    } else if (lowerCommand.includes('appeler') || lowerCommand.includes('téléphoner')) {
      action = 'Appel téléphonique';
      speak("Lancement de l'appel");
    } else if (lowerCommand.includes('message') || lowerCommand.includes('écrire')) {
      action = 'Écriture de message';
      speak("Composition du message");
    } else if (lowerCommand.includes('chercher') || lowerCommand.includes('rechercher')) {
      action = 'Recherche internet';
      speak("Lancement de la recherche");
    } else if (lowerCommand.includes('arrêt') || lowerCommand.includes('stop')) {
      setIsActivated(false);
      speak("Assistant désactivé");
      return;
    } else {
      action = 'Commande non reconnue';
      speak("Désolé, je n'ai pas compris cette commande");
    }

    const newCommand: VoiceCommand = {
      command: command,
      action: action,
      timestamp: new Date()
    };

    setCommands(prev => [newCommand, ...prev.slice(0, 9)]);
    
    // Reset activation after command
    setTimeout(() => setIsActivated(false), 3000);
  };

  const toggleListening = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
        setIsActivated(false);
      } else {
        recognition.start();
      }
    }
  };

  const features = [
    { icon: Smartphone, title: 'Gestion Apps', description: 'Ouvrir et contrôler les applications' },
    { icon: MessageSquare, title: 'Messages', description: 'Écrire et envoyer des SMS' },
    { icon: Phone, title: 'Appels', description: 'Appeler des contacts' },
    { icon: Search, title: 'Recherche', description: 'Rechercher sur internet' },
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-magic-secondary bg-clip-text text-transparent">
            Magic Assistant
          </h1>
          <p className="text-muted-foreground">
            Votre assistant vocal intelligent en français
          </p>
        </div>

        {/* Main Control */}
        <Card className="surface-glass p-6 text-center space-y-4">
          <div className="relative">
            <Button
              variant={isActivated ? "default" : "secondary"}
              size="lg"
              className={`w-24 h-24 rounded-full ${isActivated ? 'magic-glow animate-glow' : ''} ${isListening ? 'animate-pulse-magic' : ''}`}
              onClick={toggleListening}
            >
              {isListening ? (
                <Mic className="h-8 w-8" />
              ) : (
                <MicOff className="h-8 w-8" />
              )}
            </Button>
            {isActivated && (
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-magic-secondary/20 rounded-full animate-ping" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">
              {isActivated ? "🎯 En écoute..." : isListening ? "🎤 Dites 'Magic'" : "Appuyez pour activer"}
            </h3>
            <Badge variant={isActivated ? "default" : "secondary"}>
              {isActivated ? "ACTIVÉ" : isListening ? "ÉCOUTE" : "INACTIF"}
            </Badge>
          </div>

          {transcript && (
            <div className="p-3 bg-surface-elevated rounded-lg">
              <p className="text-sm text-muted-foreground">Dernière commande:</p>
              <p className="font-medium">{transcript}</p>
            </div>
          )}
        </Card>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature, index) => (
            <Card key={index} className="p-4 text-center space-y-2 hover:bg-surface-elevated transition-colors">
              <feature.icon className="h-6 w-6 mx-auto text-primary" />
              <h4 className="font-medium text-sm">{feature.title}</h4>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Recent Commands */}
        {commands.length > 0 && (
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Commandes récentes
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {commands.map((cmd, index) => (
                <div key={index} className="p-2 bg-surface-elevated rounded text-sm">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-medium">{cmd.command}</p>
                      <p className="text-xs text-muted-foreground">{cmd.action}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {cmd.timestamp.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Settings */}
        <Card className="p-4">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres de l'assistant
          </Button>
        </Card>

        {/* Instructions */}
        <Card className="p-4 space-y-2">
          <h3 className="font-semibold text-sm">Comment utiliser Magic:</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Dites "Magic" pour activer l'assistant</li>
            <li>• "Magic, ouvrir WhatsApp"</li>
            <li>• "Magic, appeler Jean"</li>
            <li>• "Magic, écrire un message à Marie"</li>
            <li>• "Magic, chercher restaurants Paris"</li>
            <li>• "Magic, arrêt" pour désactiver</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default MagicAssistant;