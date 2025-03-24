'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeCustomOptions, defaultQRCodeOptions, generateQRCodeDataURL } from '@/lib/qrcode';
import { SketchPicker } from 'react-color';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface QRCodeCustomizerProps {
  url: string;
  onCustomized: (options: QRCodeCustomOptions) => void;
  initialOptions?: Partial<QRCodeCustomOptions>;
}

export default function QRCodeCustomizer({
  url,
  onCustomized,
  initialOptions = {}
}: QRCodeCustomizerProps) {
  // Create initial state by merging the default options with any provided initial options
  const getInitialOptions = (): QRCodeCustomOptions => {
    // Start with the default options
    const merged = { ...defaultQRCodeOptions };
    
    // Merge top-level properties
    Object.keys(initialOptions).forEach(key => {
      if (key === 'color' || key === 'style' || key === 'logo') {
        // Handle nested objects separately
        return;
      }
      
      const typedKey = key as keyof QRCodeCustomOptions;
      if (initialOptions[typedKey] !== undefined) {
        (merged as any)[typedKey] = initialOptions[typedKey];
      }
    });
    
    // Merge color options if provided
    if (initialOptions.color) {
      merged.color = {
        ...merged.color,
        ...initialOptions.color
      };
    }
    
    // Merge style options if provided
    if (initialOptions.style) {
      merged.style = {
        ...merged.style,
        ...initialOptions.style
      };
    }
    
    // Merge logo options if provided
    if (initialOptions.logo) {
      merged.logo = {
        ...(merged.logo || {}),
        ...initialOptions.logo
      };
    }
    
    return merged;
  };
  
  const [options, setOptions] = useState<QRCodeCustomOptions>(getInitialOptions());
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState<{
    dark: boolean;
    light: boolean;
    border: boolean;
  }>({
    dark: false,
    light: false,
    border: false
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  
  // Generate the QR code preview whenever options change
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setError(null);
        const dataUrl = await generateQRCodeDataURL(url, options);
        setQrCodeDataUrl(dataUrl);
      } catch (err) {
        setError((err as Error).message);
        console.error('Error generating QR code:', err);
      }
    };
    
    generateQRCode();
  }, [url, options]);
  
  // Handle logo file upload
  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl(null);
      return;
    }
    
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const result = e.target?.result as string;
      setLogoPreviewUrl(result);
      
      // Update options with the new logo
      setOptions((prev) => ({
        ...prev,
        logo: {
          ...(prev.logo || {}),
          src: result
        }
      }));
    };
    
    fileReader.readAsDataURL(logoFile);
  }, [logoFile]);
  
  // Handle logo file input change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };
  
  // Handle removing logo
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreviewUrl(null);
    setOptions((prev) => ({
      ...prev,
      logo: undefined
    }));
  };
  
  // Handle generic option changes
  const handleOptionChange = <K extends keyof QRCodeCustomOptions>(
    key: K,
    value: QRCodeCustomOptions[K]
  ) => {
    setOptions((prev) => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Handle nested option changes
  const handleNestedOptionChange = <
    K extends keyof QRCodeCustomOptions,
    NK extends keyof NonNullable<QRCodeCustomOptions[K]>
  >(
    key: K,
    nestedKey: NK,
    value: any
  ) => {
    setOptions((prev) => {
      // Make a copy of the previous state
      const newOptions = { ...prev };
      
      // Ensure the nested object exists
      if (!newOptions[key]) {
        (newOptions[key] as any) = {};
      }
      
      // Set the nested property
      const nestedObj = newOptions[key] as any;
      nestedObj[nestedKey] = value;
      
      return newOptions;
    });
  };
  
  // Apply customizations
  const handleApply = () => {
    onCustomized(options);
  };
  
  // Reset to defaults
  const handleReset = () => {
    setOptions(defaultQRCodeOptions);
    setLogoFile(null);
    setLogoPreviewUrl(null);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* QR Code Preview */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>QR Code Preview</CardTitle>
          <CardDescription>
            Live preview of your customized QR code
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl}
              alt="QR Code Preview"
              className="max-w-full border rounded-md"
            />
          ) : (
            <div className="flex items-center justify-center w-64 h-64 bg-gray-100 rounded-md">
              Loading...
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </CardFooter>
      </Card>
      
      {/* Customization Options */}
      <div>
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="logo">Logo</TabsTrigger>
          </TabsList>
          
          {/* Basic Settings */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Settings</CardTitle>
                <CardDescription>
                  Configure basic QR code properties
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="size"
                      min={100}
                      max={1000}
                      step={10}
                      value={[options.width || 300]}
                      onValueChange={(value) => handleOptionChange('width', value[0])}
                    />
                    <span className="w-16 text-center">
                      {options.width || 300}px
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="margin">Margin</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="margin"
                      min={0}
                      max={5}
                      step={1}
                      value={[options.margin || 1]}
                      onValueChange={(value) => handleOptionChange('margin', value[0])}
                    />
                    <span className="w-16 text-center">
                      {options.margin || 1}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="errorCorrectionLevel">Error Correction Level</Label>
                  <Select
                    value={options.errorCorrectionLevel || 'M'}
                    onValueChange={(value) => 
                      handleOptionChange('errorCorrectionLevel', value as 'L' | 'M' | 'Q' | 'H')
                    }
                  >
                    <SelectTrigger id="errorCorrectionLevel">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Error Correction Level</SelectLabel>
                        <SelectItem value="L">L - Low (7%)</SelectItem>
                        <SelectItem value="M">M - Medium (15%)</SelectItem>
                        <SelectItem value="Q">Q - Quartile (25%)</SelectItem>
                        <SelectItem value="H">H - High (30%)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Higher levels allow for more damage without data loss
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Color Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Color Settings</CardTitle>
                <CardDescription>
                  Customize the colors of your QR code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="darkColor">Dark Color</Label>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-10 h-10 rounded-md border cursor-pointer"
                      style={{ backgroundColor: options.color?.dark || '#000000' }}
                      onClick={() => 
                        setIsColorPickerOpen((prev) => ({ ...prev, dark: !prev.dark }))
                      }
                    />
                    <Input
                      id="darkColor"
                      value={options.color?.dark || '#000000'}
                      onChange={(e) => 
                        handleNestedOptionChange('color', 'dark', e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                  {isColorPickerOpen.dark && (
                    <div className="mt-2 absolute z-10">
                      <div 
                        className="fixed inset-0" 
                        onClick={() => 
                          setIsColorPickerOpen((prev) => ({ ...prev, dark: false }))
                        }
                      />
                      <SketchPicker
                        color={options.color?.dark || '#000000'}
                        onChange={(color) => 
                          handleNestedOptionChange('color', 'dark', color.hex)
                        }
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lightColor">Light Color</Label>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-10 h-10 rounded-md border cursor-pointer"
                      style={{ backgroundColor: options.color?.light || '#FFFFFF' }}
                      onClick={() => 
                        setIsColorPickerOpen((prev) => ({ ...prev, light: !prev.light }))
                      }
                    />
                    <Input
                      id="lightColor"
                      value={options.color?.light || '#FFFFFF'}
                      onChange={(e) => 
                        handleNestedOptionChange('color', 'light', e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                  {isColorPickerOpen.light && (
                    <div className="mt-2 absolute z-10">
                      <div 
                        className="fixed inset-0" 
                        onClick={() => 
                          setIsColorPickerOpen((prev) => ({ ...prev, light: false }))
                        }
                      />
                      <SketchPicker
                        color={options.color?.light || '#FFFFFF'}
                        onChange={(color) => 
                          handleNestedOptionChange('color', 'light', color.hex)
                        }
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Style Settings */}
          <TabsContent value="style" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Style Settings</CardTitle>
                <CardDescription>
                  Customize the appearance of your QR code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dotShape">Dot Shape</Label>
                  <Select
                    value={options.style?.dotShape || 'square'}
                    onValueChange={(value) => 
                      handleNestedOptionChange('style', 'dotShape', value as 'square' | 'rounded' | 'dots')
                    }
                  >
                    <SelectTrigger id="dotShape">
                      <SelectValue placeholder="Select shape" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Dot Shape</SelectLabel>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="rounded">Rounded</SelectItem>
                        <SelectItem value="dots">Dots</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cornerShape">Corner Shape</Label>
                  <Select
                    value={options.style?.cornerShape || 'square'}
                    onValueChange={(value) => 
                      handleNestedOptionChange('style', 'cornerShape', value as 'square' | 'rounded')
                    }
                  >
                    <SelectTrigger id="cornerShape">
                      <SelectValue placeholder="Select shape" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Corner Shape</SelectLabel>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="rounded">Rounded</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cornerDotStyle">Corner Dot Style</Label>
                  <Select
                    value={options.style?.cornerDotStyle || 'square'}
                    onValueChange={(value) => 
                      handleNestedOptionChange('style', 'cornerDotStyle', value as 'square' | 'dot')
                    }
                  >
                    <SelectTrigger id="cornerDotStyle">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Corner Dot Style</SelectLabel>
                        <SelectItem value="square">Square</SelectItem>
                        <SelectItem value="dot">Dot</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Logo Settings */}
          <TabsContent value="logo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Logo Settings</CardTitle>
                <CardDescription>
                  Add a logo to the center of your QR code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Upload Logo</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                  {logoPreviewUrl && (
                    <div className="mt-2">
                      <div className="text-sm font-bold mb-1">Preview:</div>
                      <div className="flex items-center space-x-2">
                        <img
                          src={logoPreviewUrl}
                          alt="Logo Preview"
                          className="w-16 h-16 object-contain border rounded-md"
                        />
                        <Button variant="destructive" size="sm" onClick={handleRemoveLogo}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {options.logo && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="logoSize">Logo Size</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          id="logoSize"
                          min={5}
                          max={30}
                          step={1}
                          value={[
                            (options.logo.width || (options.width || 300) * 0.2) / 
                            (options.width || 300) * 100
                          ]}
                          onValueChange={(value) => 
                            handleNestedOptionChange(
                              'logo', 
                              'width', 
                              (options.width || 300) * (value[0] / 100)
                            )
                          }
                        />
                        <span className="w-16 text-center">
                          {Math.round(
                            (options.logo.width || (options.width || 300) * 0.2) / 
                            (options.width || 300) * 100
                          )}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="logoOpacity">Logo Opacity</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          id="logoOpacity"
                          min={10}
                          max={100}
                          step={5}
                          value={[(options.logo.opacity || 1) * 100]}
                          onValueChange={(value) => 
                            handleNestedOptionChange('logo', 'opacity', value[0] / 100)
                          }
                        />
                        <span className="w-16 text-center">
                          {(options.logo.opacity || 1) * 100}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="logoBorder"
                          checked={options.logo.border !== false}
                          onCheckedChange={(checked) => 
                            handleNestedOptionChange('logo', 'border', checked)
                          }
                        />
                        <Label htmlFor="logoBorder">Add Border</Label>
                      </div>
                    </div>
                    
                    {options.logo.border && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="logoBorderWidth">Border Width</Label>
                          <div className="flex items-center space-x-2">
                            <Slider
                              id="logoBorderWidth"
                              min={1}
                              max={10}
                              step={1}
                              value={[options.logo.borderWidth || 5]}
                              onValueChange={(value) => 
                                handleNestedOptionChange('logo', 'borderWidth', value[0])
                              }
                            />
                            <span className="w-16 text-center">
                              {options.logo.borderWidth || 5}px
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="logoBorderColor">Border Color</Label>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-10 h-10 rounded-md border cursor-pointer"
                              style={{ backgroundColor: options.logo.borderColor || '#FFFFFF' }}
                              onClick={() => 
                                setIsColorPickerOpen((prev) => ({ ...prev, border: !prev.border }))
                              }
                            />
                            <Input
                              id="logoBorderColor"
                              value={options.logo.borderColor || '#FFFFFF'}
                              onChange={(e) => 
                                handleNestedOptionChange('logo', 'borderColor', e.target.value)
                              }
                              className="flex-1"
                            />
                          </div>
                          {isColorPickerOpen.border && (
                            <div className="mt-2 absolute z-10">
                              <div 
                                className="fixed inset-0" 
                                onClick={() => 
                                  setIsColorPickerOpen((prev) => ({ ...prev, border: false }))
                                }
                              />
                              <SketchPicker
                                color={options.logo.borderColor || '#FFFFFF'}
                                onChange={(color) => 
                                  handleNestedOptionChange('logo', 'borderColor', color.hex)
                                }
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="logoBorderRadius">Border Radius</Label>
                      <div className="flex items-center space-x-2">
                        <Slider
                          id="logoBorderRadius"
                          min={0}
                          max={20}
                          step={1}
                          value={[options.logo.borderRadius || 0]}
                          onValueChange={(value) => 
                            handleNestedOptionChange('logo', 'borderRadius', value[0])
                          }
                        />
                        <span className="w-16 text-center">
                          {options.logo.borderRadius || 0}px
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 